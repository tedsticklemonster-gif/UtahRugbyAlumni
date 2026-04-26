"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export async function cancelEventAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("events")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "event.cancel",
    targetTable: "events",
    targetId: id,
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export async function uncancelEventAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("events")
    .update({ cancelled_at: null })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "event.update",
    targetTable: "events",
    targetId: id,
    payload: { cancelled_at: null },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true };
}

export interface RsvpExportRow {
  alumni_name: string;
  email: string;
  status: string;
  rsvp_at: string;
}

export async function getEventRsvpsAction(
  eventId: string
): Promise<{ success: boolean; rsvps?: RsvpExportRow[]; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("event_rsvps")
    .select(
      `status, created_at,
       alumni:alumni!alumni_id(first_name, last_name, email)`
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) return { success: false, error: error.message };

  const rsvps = (data ?? []).map((r) => {
    const raw = r.alumni as unknown;
    const a = Array.isArray(raw)
      ? (raw[0] as { first_name: string; last_name: string; email: string } | undefined)
      : (raw as { first_name: string; last_name: string; email: string } | null);
    return {
      alumni_name: a ? `${a.first_name} ${a.last_name}` : "Unknown",
      email: a?.email ?? "",
      status: r.status,
      rsvp_at: r.created_at,
    };
  });

  return { success: true, rsvps };
}
