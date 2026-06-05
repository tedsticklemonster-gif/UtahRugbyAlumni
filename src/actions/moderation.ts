"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMyId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("alumni").select("id").eq("email", user.email).single();
  return data?.id ?? null;
}

export async function blockUserAction(blockedId: string): Promise<{ error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: "Not authenticated" };
  if (myId === blockedId) return { error: "Cannot block yourself" };

  const admin = createAdminClient();
  await admin.from("blocks").upsert(
    { blocker_id: myId, blocked_id: blockedId },
    { onConflict: "blocker_id,blocked_id" }
  );
  return {};
}

export async function unblockUserAction(blockedId: string): Promise<{ error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  await admin.from("blocks").delete().eq("blocker_id", myId).eq("blocked_id", blockedId);
  return {};
}

export async function getBlockedUsersAction(): Promise<string[]> {
  const myId = await getMyId();
  if (!myId) return [];

  const admin = createAdminClient();
  const { data } = await admin.from("blocks").select("blocked_id").eq("blocker_id", myId);
  return (data ?? []).map((b) => b.blocked_id);
}

export async function reportContentAction(
  targetType: "alumni" | "post" | "comment" | "event" | "message",
  targetId: string,
  reason: "spam" | "harassment" | "inappropriate" | "fake_profile" | "other",
  details?: string
): Promise<{ error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin.from("reports").insert({
    reporter_id: myId,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details?.trim() || null,
  });

  if (error) return { error: error.message };
  return {};
}

export type Report = {
  id: string;
  created_at: string;
  reporter_name: string;
  reason: string;
  details: string | null;
  target_type: string;
  target_id: string;
  status: string;
};

export async function listReportsAction(): Promise<Report[]> {
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("id, created_at, reporter_id, reason, details, target_type, target_id, status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!reports?.length) return [];

  const reporterIds = [...new Set(reports.map((r) => r.reporter_id))];
  const { data: reporters } = await admin
    .from("alumni")
    .select("id, first_name, last_name")
    .in("id", reporterIds);

  const reporterMap = new Map((reporters ?? []).map((r) => [r.id, `${r.first_name} ${r.last_name}`]));

  return reports.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    reporter_name: reporterMap.get(r.reporter_id) ?? "Unknown",
    reason: r.reason,
    details: r.details,
    target_type: r.target_type,
    target_id: r.target_id,
    status: r.status,
  }));
}

export async function updateReportStatusAction(
  reportId: string,
  status: "reviewed" | "actioned" | "dismissed"
): Promise<{ error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: myId })
    .eq("id", reportId);

  if (error) return { error: error.message };
  revalidatePath("/admin/moderation");
  return {};
}
