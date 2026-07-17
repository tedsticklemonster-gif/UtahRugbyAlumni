import { render } from "@react-email/components";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL, FROM_NAME, hasVerifiedSender } from "@/lib/resend";
import { PledgeReminderEmail } from "@/emails/pledge-reminder";
import type { JobDefinition } from "./index";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://utah-rugby-alumni.vercel.app";
const REMIND_AFTER_DAYS = 7;
const REMIND_COOLDOWN_DAYS = 30; // don't nag the same donor more than monthly

function formatAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Email pledged-but-unpaid donors a monthly nudge once their pledge is a week old. */
export const pledgeReminders: JobDefinition = {
  name: "pledge-reminders",
  schedule: "0 14 * * 1", // Mondays 14:00 UTC

  async run() {
    if (!hasVerifiedSender()) {
      return { ok: true, skipped: "no verified sender (set EMAIL_FROM)" };
    }

    const admin = createAdminClient();
    const cutoff = new Date(Date.now() - REMIND_AFTER_DAYS * 86_400_000).toISOString();
    const cooldownCutoff = new Date(
      Date.now() - REMIND_COOLDOWN_DAYS * 86_400_000
    ).toISOString();

    const { data: pledges } = await admin
      .from("pledges")
      .select("id, alumni_id, donor_name, donor_email, amount_cents, campaign_id, campaigns(name)")
      .eq("status", "pledged")
      .lt("pledged_at", cutoff);

    if (!pledges?.length) return { ok: true, sent: 0, due: 0 };

    // One reminder per donor per cooldown window.
    const { data: recentReminders } = await admin
      .from("email_sends")
      .select("recipient_email")
      .eq("campaign", "pledge_reminder")
      .gte("sent_at", cooldownCutoff);
    const recentlyReminded = new Set(
      (recentReminders ?? []).map((r) => r.recipient_email.toLowerCase())
    );

    let sent = 0;
    const errors: string[] = [];

    for (const pledge of pledges) {
      const email = pledge.donor_email?.toLowerCase();
      if (!email || recentlyReminded.has(email)) continue;

      // Supabase types to-one joins as arrays; normalize either shape.
      const joined = pledge.campaigns as unknown as
        | { name: string }
        | { name: string }[]
        | null;
      const campaignName =
        (Array.isArray(joined) ? joined[0]?.name : joined?.name) ?? "the season campaign";

      try {
        const html = await render(
          PledgeReminderEmail({
            donorName: pledge.donor_name?.split(" ")[0] ?? "Friend",
            amount: formatAmount(pledge.amount_cents),
            campaignName,
            givingUrl: `${APP_URL}/me/giving`,
          })
        );

        const { data: sendResult } = await getResend().emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: pledge.donor_email,
          subject: "Friendly nudge on your Utah Rugby pledge",
          html,
        });

        await admin.from("email_sends").insert({
          alumni_id: pledge.alumni_id,
          recipient_email: pledge.donor_email,
          campaign: "pledge_reminder",
          resend_id: sendResult?.id ?? null,
        });

        recentlyReminded.add(email);
        sent++;
        // Light rate limit between sends
        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }

    return { ok: errors.length === 0, sent, due: pledges.length, errors: errors.slice(0, 5) };
  },
};
