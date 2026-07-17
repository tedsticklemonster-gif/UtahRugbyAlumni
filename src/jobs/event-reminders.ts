import { render } from "@react-email/components";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToAlumni } from "@/lib/push";
import { resend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import { EventReminderEmail } from "@/emails/event-reminder";
import { unsubscribeUrl } from "@/lib/unsubscribe-token";
import type { JobDefinition, JobResult } from "@/jobs/index";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://utah-rugby-alumni.vercel.app";

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const eventReminders: JobDefinition = {
  name: "event-reminders",
  schedule: "0 * * * *", // every hour
  async run(): Promise<JobResult> {
    const admin = createAdminClient();

    // Find events starting in 23-25 hours (2-hour window ensures hourly cron catches each event once)
    const now = new Date();
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: events } = await admin
      .from("events")
      .select("id, title, starts_at, location, kind")
      .is("deleted_at", null)
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString());

    if (!events?.length) return { ok: true, events: 0, pushSent: 0, emailSent: 0 };

    let totalPush = 0;
    let totalEmail = 0;

    for (const event of events) {
      // Get RSVPs (going + maybe)
      const { data: rsvps } = await admin
        .from("event_rsvps")
        .select("alumni_id")
        .eq("event_id", event.id)
        .in("status", ["going", "maybe"]);

      if (!rsvps?.length) continue;

      const alumniIds = rsvps.map((r) => r.alumni_id);

      // Get alumni details
      const { data: alumni } = await admin
        .from("alumni")
        .select("id, first_name, email, email_preferences, status")
        .in("id", alumniIds);

      if (!alumni?.length) continue;

      // Check which reminders have already been sent
      const { data: alreadySent } = await admin
        .from("event_reminders_sent")
        .select("alumni_id, channel")
        .eq("event_id", event.id);

      const sentSet = new Set((alreadySent ?? []).map((s) => `${s.alumni_id}:${s.channel}`));

      const eventUrl = `${APP_URL}/events/${event.id}`;
      const eventDate = formatEventDate(event.starts_at);

      for (const alum of alumni) {
        // Push notification
        if (!sentSet.has(`${alum.id}:push`)) {
          try {
            await sendPushToAlumni(alum.id, {
              title: `Reminder: ${event.title}`,
              body: `Tomorrow — ${eventDate}${event.location ? ` at ${event.location}` : ""}`,
              url: eventUrl,
            });

            await admin.from("event_reminders_sent").insert({
              event_id: event.id,
              alumni_id: alum.id,
              channel: "push",
            });

            totalPush++;
          } catch (err) {
            console.error(`[event-reminders] Push failed for ${alum.id}:`, err);
          }
        }

        // Email notification
        if (!sentSet.has(`${alum.id}:email`)) {
          // Respect opt-out
          if (alum.status === "opted_out") continue;
          const prefs = (alum.email_preferences ?? {}) as Record<string, unknown>;
          if (prefs.event_reminders === false) continue;
          if (!alum.email || alum.email.includes("@placeholder.local") || alum.email.includes("@removed.local")) continue;

          try {
            const html = await render(
              EventReminderEmail({
                firstName: alum.first_name,
                eventTitle: event.title,
                eventDate,
                eventLocation: event.location,
                eventUrl,
                unsubscribeUrl: unsubscribeUrl(alum.id),
              })
            );

            const { data: sendResult } = await resend.emails.send({
              from: `${FROM_NAME} <${FROM_EMAIL}>`,
              to: alum.email,
              subject: `Reminder: ${event.title} is tomorrow!`,
              html,
            });

            await admin.from("event_reminders_sent").insert({
              event_id: event.id,
              alumni_id: alum.id,
              channel: "email",
            });

            await admin.from("email_sends").insert({
              alumni_id: alum.id,
              recipient_email: alum.email,
              campaign: "event_reminder",
              resend_id: sendResult?.id ?? null,
            });

            totalEmail++;

            // Rate limit
            await new Promise((r) => setTimeout(r, 100));
          } catch (err) {
            console.error(`[event-reminders] Email failed for ${alum.email}:`, err);
          }
        }

        // In-app notification
        await admin.from("notifications").insert({
          recipient_id: alum.id,
          actor_id: null,
          kind: "event_reminder",
          entity_type: "event",
          entity_id: event.id,
        }).then(() => {}, () => {}); // ignore duplicate errors
      }
    }

    return { ok: true, events: events.length, pushSent: totalPush, emailSent: totalEmail };
  },
};
