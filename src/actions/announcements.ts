"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export interface AnnouncementFormData {
  title: string;
  body: string;
  pinned: boolean;
  expires_at: string | null; // ISO string or null
}

export async function createAnnouncementAction(
  data: AnnouncementFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("announcements")
    .insert({
      title: data.title.trim(),
      body: data.body.trim(),
      pinned: data.pinned,
      expires_at: data.expires_at || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "announcement.create",
    targetTable: "announcements",
    targetId: row.id,
    payload: { title: data.title },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/feed");
  return { success: true, id: row.id };
}

export async function updateAnnouncementAction(
  id: string,
  data: AnnouncementFormData
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("announcements")
    .update({
      title: data.title.trim(),
      body: data.body.trim(),
      pinned: data.pinned,
      expires_at: data.expires_at || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "announcement.update",
    targetTable: "announcements",
    targetId: id,
    payload: { title: data.title },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/feed");
  return { success: true };
}

export async function deleteAnnouncementAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("announcements").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "announcement.delete",
    targetTable: "announcements",
    targetId: id,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/feed");
  return { success: true };
}
