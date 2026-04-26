"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export async function deletePostAction(
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
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "post.delete",
    targetTable: "posts",
    targetId: id,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/feed");
  return { success: true };
}

export async function restorePostAction(
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
    .from("posts")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "post.restore",
    targetTable: "posts",
    targetId: id,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/feed");
  return { success: true };
}
