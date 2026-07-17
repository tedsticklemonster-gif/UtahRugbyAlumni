import { render } from "@react-email/components";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL, FROM_NAME, hasVerifiedSender } from "@/lib/resend";
import { unsubscribeUrl } from "@/lib/unsubscribe-token";
import { WeeklyDigestEmail } from "@/emails/weekly-digest";
import type { JobDefinition } from "./index";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://utah-rugby-alumni.vercel.app";
const BATCH_SIZE = 100; // Resend batch.send limit

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

    const newAlumni = newAlumniRes.data ?? [];
    const upcomingEvents = upcomingRes.data ?? [];
    const postsCount = postsRes.count ?? 0;

    const stats = {
      window: { from: weekAgo, to: now },
      new_alumni_count: newAlumni.length,
      upcoming_events_count: upcomingEvents.length,
      posts_this_week: postsCount,
    };

    // Nothing worth emailing about — skip quiet weeks.
    if (newAlumni.length === 0 && upcomingEvents.length === 0 && postsCount === 0) {
      return { ok: true, skipped: "quiet week", ...stats };
    }

    const testRecipient = process.env.DIGEST_TEST_RECIPIENT || null;

    // Until a verified sending domain is configured, only send in test mode —
    // the resend.dev sender can't reliably reach the membership.
    if (!hasVerifiedSender() && !testRecipient) {
      return { ok: true, skipped: "no verified sender (set EMAIL_FROM)", ...stats };
    }

    // Recipients: real emails, not opted out, digest not disabled.
    const { data: recipients } = await admin
      .from("alumni")
      .select("id, first_name, email, email_preferences")
      .in("status", ["self_registered", "imported"])
      .not("email", "is", null);

    const eligible = (recipients ?? []).filter((a) => {
      if (!a.email || a.email.includes("@placeholder.local") || a.email.includes("@removed.local")) return false;
      const prefs = (a.email_preferences ?? {}) as Record<string, unknown>;
      return prefs.weekly_digest !== false;
    });

    const digestEvents = upcomingEvents.map((e) => ({
      title: e.title,
      date: new Date(e.starts_at).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      location: e.location,
      url: `${APP_URL}/events/${e.id}`,
    }));
    const digestAlumni = newAlumni.map((a) => ({
      firstName: a.first_name,
      lastName: a.last_name,
      gradYear: a.grad_year,
    }));

    // Test mode: render one digest to the test address only, no tracking rows.
    if (testRecipient) {
      const html = await render(
        WeeklyDigestEmail({
          firstName: "Moose",
          newAlumni: digestAlumni,
          upcomingEvents: digestEvents,
          postsCount,
          appUrl: APP_URL,
        })
      );
      await getResend().emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: testRecipient,
        subject: "This week in the Utah Rugby alumni network",
        html,
      });
      return { ok: true, test_sent_to: testRecipient, eligible_count: eligible.length, ...stats };
    }

    let sent = 0;
    const errors: string[] = [];

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE);
      try {
        const payloads = await Promise.all(
          batch.map(async (a) => ({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: a.email as string,
            subject: "This week in the Utah Rugby alumni network",
            html: await render(
              WeeklyDigestEmail({
                firstName: a.first_name,
                newAlumni: digestAlumni,
                upcomingEvents: digestEvents,
                postsCount,
                appUrl: APP_URL,
                unsubscribeUrl: unsubscribeUrl(a.id),
              })
            ),
          }))
        );

        const { data: batchResult } = await getResend().batch.send(payloads);

        await admin.from("email_sends").insert(
          batch.map((a, j) => ({
            alumni_id: a.id,
            recipient_email: a.email as string,
            campaign: "weekly_digest",
            resend_id: batchResult?.data?.[j]?.id ?? null,
          }))
        );
        sent += batch.length;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }

    return { ok: errors.length === 0, sent, errors: errors.slice(0, 5), ...stats };
  },
};
