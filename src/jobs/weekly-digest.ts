import { createAdminClient } from "@/lib/supabase/admin";
import type { JobDefinition } from "./index";

export const weeklyDigest: JobDefinition = {
  name: "weekly-digest",
  schedule: "0 15 * * 1", // Mondays 15:00 UTC

  async run() {
    const admin = createAdminClient();
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const now = new Date().toISOString();

    const [newAlumniRes, upcomingRes, postsRes] = await Promise.all([
      admin
        .from("alumni")
        .select("id, first_name, last_name, grad_year, city, state")
        .in("status", ["self_registered", "imported"])
        .eq("directory_visible", true)
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("events")
        .select("id, title, starts_at, location")
        .is("cancelled_at", null)
        .is("deleted_at", null)
        .gte("starts_at", now)
        .lte("starts_at", new Date(Date.now() + 14 * 86_400_000).toISOString())
        .order("starts_at", { ascending: true })
        .limit(5),
      admin
        .from("posts")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .gte("created_at", weekAgo),
    ]);

    const digest = {
      window: { from: weekAgo, to: now },
      new_alumni_count: newAlumniRes.data?.length ?? 0,
      upcoming_events_count: upcomingRes.data?.length ?? 0,
      posts_this_week: postsRes.count ?? 0,
    };

    // TODO: render Resend email template and send to verified alumni
    // Wire up once domain is provisioned and a digest email template is built.

    return { ok: true, ...digest };
  },
};
