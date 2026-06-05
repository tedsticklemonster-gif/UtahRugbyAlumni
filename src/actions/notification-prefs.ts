"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateNotificationPrefsAction(prefs: Record<string, boolean>): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("alumni")
    .update({ email_preferences: prefs })
    .eq("email", user.email);

  if (error) return { error: error.message };
  return {};
}
