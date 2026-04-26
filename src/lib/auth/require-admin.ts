import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Shared admin auth guard for server actions.
 * Throws with a user-readable message on failure so callers can catch and return early.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  if (user.app_metadata?.role !== "admin") throw new Error("Not authorized");

  return user;
}
