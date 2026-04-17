"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const role = user.app_metadata?.role;
  if (role !== "admin") throw new Error("Not authorized");

  return user;
}

export async function updateAlumniStatusAction(
  ids: string[],
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const validStatuses = [
    "self_registered",
    "imported",
    "needs_research",
    "unreachable",
    "opted_out",
  ];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("alumni")
    .update({ status })
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/roster");
  return { success: true };
}

export async function deleteAlumniAction(
  ids: string[]
): Promise<{ success: boolean; error?: string; deleted: number }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized.", deleted: 0 };
  }

  if (!ids.length) {
    return { success: false, error: "No records selected.", deleted: 0 };
  }

  const admin = createAdminClient();

  // Fetch photo_url for selected records so we can clean up storage
  const { data: records } = await admin
    .from("alumni")
    .select("id, photo_url")
    .in("id", ids);

  const photoPaths = (records ?? [])
    .map((r) => r.photo_url)
    .filter(Boolean) as string[];

  // Delete photos from storage bucket
  if (photoPaths.length > 0) {
    await admin.storage.from("alumni-photos").remove(photoPaths);
  }

  // Delete the alumni records
  const { error, count } = await admin
    .from("alumni")
    .delete({ count: "exact" })
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message, deleted: 0 };
  }

  revalidatePath("/admin/roster");
  return { success: true, deleted: count ?? ids.length };
}

export type ImportResult = {
  created: number;
  skipped: number;
  errors: string[];
};

export async function importCsvAction(
  formData: FormData
): Promise<ImportResult> {
  await requireAdmin();

  const raw = formData.get("rows");
  if (!raw || typeof raw !== "string") {
    return { created: 0, skipped: 0, errors: ["No data provided."] };
  }

  const rows: Record<string, string>[] = JSON.parse(raw);
  const admin = createAdminClient();

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row.email?.trim()?.toLowerCase();

    if (!row.first_name || !row.last_name) {
      errors.push(`Row ${i + 1}: Missing first_name or last_name.`);
      continue;
    }

    // Check for duplicate by email if email is provided
    if (email) {
      const { data: existing } = await admin
        .from("alumni")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }
    }

    const status = email ? "imported" : "needs_research";

    const { error } = await admin.from("alumni").insert({
      first_name: row.first_name.trim(),
      last_name: row.last_name.trim(),
      email: email || `import-${Date.now()}-${i}@placeholder.local`,
      grad_year: row.grad_year ? parseInt(row.grad_year) : null,
      position: row.position?.trim() || null,
      phone: row.phone?.trim() || null,
      profession: row.profession?.trim() || null,
      job_title: row.job_title?.trim() || null,
      company: row.company?.trim() || null,
      city: row.city?.trim() || null,
      state: row.state?.trim() || null,
      linkedin_url: row.linkedin_url?.trim() || null,
      // SMS CONSENT: Imported records default to false.
      // NEVER set sms_consent = true on import.
      sms_consent: false,
      directory_visible: false,
      verified: false,
      status,
      source: "csv_import",
    });

    if (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    } else {
      created++;
    }
  }

  // NOTE: Imported records do NOT get auto-sent emails.
  // CSV import and email send are separate, deliberate actions.

  revalidatePath("/admin/roster");
  return { created, skipped, errors };
}

/* ── Forward Tokens ──────────────────────────────────────── */

export interface ForwardToken {
  id: string;
  token: string;
  referrer_alumni_id: string | null;
  referrer_name: string | null;
  created_at: string;
  signups_attributed: number;
}

export async function listForwardTokensAction(): Promise<{
  success: boolean;
  tokens: ForwardToken[];
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, tokens: [], error: "Not authorized." };
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("forward_tokens")
    .select("id, token, referrer_alumni_id, created_at, signups_attributed")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, tokens: [], error: error.message };
  }

  // Fetch referrer names
  const referrerIds = (data ?? [])
    .map((t) => t.referrer_alumni_id)
    .filter(Boolean) as string[];

  let nameMap = new Map<string, string>();
  if (referrerIds.length > 0) {
    const { data: alumni } = await admin
      .from("alumni")
      .select("id, first_name, last_name")
      .in("id", referrerIds);

    nameMap = new Map(
      (alumni ?? []).map((a) => [a.id, `${a.first_name} ${a.last_name}`])
    );
  }

  const tokens: ForwardToken[] = (data ?? []).map((t) => ({
    ...t,
    referrer_name: t.referrer_alumni_id
      ? nameMap.get(t.referrer_alumni_id) ?? null
      : null,
  }));

  return { success: true, tokens };
}

export async function createForwardTokenAction(
  alumniId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();

  // Generate a readable token from the alumni's name
  const { data: alumni } = await admin
    .from("alumni")
    .select("first_name, last_name")
    .eq("id", alumniId)
    .single();

  if (!alumni) {
    return { success: false, error: "Alumni not found." };
  }

  const slug = `${alumni.first_name}-${alumni.last_name}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

  // Check if token already exists for this alumni
  const { data: existing } = await admin
    .from("forward_tokens")
    .select("token")
    .eq("referrer_alumni_id", alumniId)
    .maybeSingle();

  if (existing) {
    return { success: true, token: existing.token };
  }

  const token = `${slug}-${Date.now().toString(36)}`;

  const { error } = await admin.from("forward_tokens").insert({
    token,
    referrer_alumni_id: alumniId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/tokens");
  return { success: true, token };
}
