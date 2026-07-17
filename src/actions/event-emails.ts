"use server";

import { render } from "@react-email/components";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import { NewEventEmail } from "@/emails/new-event";
import { unsubscribeUrl } from "@/lib/unsubscribe-token";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://utah-rugby-alumni.vercel.app";

const KIND_LABELS: Record<string, string> = {
  social: "Social",
  reunion: "Reunion",
  watch_party: "Watch Party",
  practice: "Practice",
  other: "Event",
};

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

/**
 * Notify all verified alumni about a new event.
 * Designed to be called fire-and-forget from createEventAction.
 */
export async function notifyNewEvent(eventId: string) {
  try {
    const admin = createAdminClient();

    // Fetch the event
    const { data: event } = await admin
      .from("events")
      .select("id, title, description, starts_at, location, kind")
      .eq("id", eventId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!event) return;

    // Fetch verified alumni who haven't opted out and want new event emails
    const { data: recipients } = await admin
      .from("alumni")
      .select("id, first_name, email, email_preferences")
      .eq("verified", true)
      .neq("status", "opted_out")
      .not("email", "ilike", "%@placeholder.local%")
      .not("email", "ilike", "%@removed.local%");

    if (!recipients?.length) return;

    const kindLabel = KIND_LABELS[event.kind] ?? "Event";
    const eventUrl = `${APP_URL}/events/${event.id}`;
    const eventDate = formatEventDate(event.starts_at);

    let sent = 0;
    for (const recipient of recipients) {
      // Check email_preferences for opt-out
      const prefs = (recipient.email_preferences ?? {}) as Record<string, unknown>;
      if (prefs.new_events === false) continue;

      // Deduplicate: skip if already sent for this event
      const { data: existing } = await admin
        .from("email_sends")
        .select("id")
        .eq("alumni_id", recipient.id)
        .eq("campaign", "new_event")
        .eq("recipient_email", recipient.email)
        .maybeSingle();

      if (existing) continue;

      try {
        const html = await render(
          NewEventEmail({
            firstName: recipient.first_name,
            eventTitle: event.title,
            eventKind: event.kind,
            eventDate,
            eventLocation: event.location,
            eventUrl,
            unsubscribeUrl: unsubscribeUrl(recipient.id),
          })
        );

        const { data: sendResult } = await getResend().emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: recipient.email,
          subject: `New ${kindLabel}: ${event.title}`,
          html,
        });

        await admin.from("email_sends").insert({
          alumni_id: recipient.id,
          recipient_email: recipient.email,
          campaign: "new_event",
          resend_id: sendResult?.id ?? null,
        });

        sent++;

        // Rate-limit: 100ms between sends
        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        console.error(`[notifyNewEvent] Failed to send to ${recipient.email}:`, err);
      }
    }

  } catch (err) {
    console.error("[notifyNewEvent] Error:", err);
  }
}
