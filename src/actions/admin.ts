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
