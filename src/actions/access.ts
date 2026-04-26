"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export interface AuthUser {
  id: string;
  email: string;
  role: string | null;
  created_at: string;
  // Matched alumni info
  alumni_name: string | null;
}

export async function listAuthUsersAction(): Promise<{
  success: boolean;
  users: AuthUser[];
  error?: string;
}> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, users: [], error: "Not authorized." };
  }

  const admin = createAdminClient();

  // List all auth users
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) {
    return { success: false, users: [], error: error.message };
  }

  // Get alumni records to match names
  const emails = data.users.map((u) => u.email).filter(Boolean) as string[];
  const { data: alumniData } = await admin
    .from("alumni")
    .select("email, first_name, last_name")
    .in("email", emails);

  const alumniByEmail = new Map(
    (alumniData ?? []).map((a) => [
      a.email,
      `${a.first_name} ${a.last_name}`,
    ])
  );

  const users: AuthUser[] = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: u.app_metadata?.role ?? null,
    created_at: u.created_at,
    alumni_name: alumniByEmail.get(u.email ?? "") ?? null,
  }));

  return { success: true, users };
}

export async function toggleAdminAction(
  userId: string,
  grant: boolean
): Promise<{ success: boolean; error?: string }> {
  let currentUser;
  try {
    currentUser = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  // Prevent revoking your own admin access
  if (!grant && userId === currentUser.id) {
    return {
      success: false,
      error: "You cannot revoke your own admin access.",
    };
  }

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: grant ? "admin" : null },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await logAdminAction({
    actorId: currentUser.id,
    actorEmail: currentUser.email!,
    action: grant ? "admin_role.grant" : "admin_role.revoke",
    targetTable: "auth.users",
    targetId: userId,
    payload: { grant },
  });

  revalidatePath("/admin/access");
  return { success: true };
}
