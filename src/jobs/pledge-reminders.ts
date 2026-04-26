import type { JobDefinition } from "./index";

/**
 * Placeholder: email pledged-but-unpaid donors after N days.
 * Disabled until the fundraising module is complete and Resend domain is live.
 *
 * To activate: add to vercel.json crons and wire a Resend template.
 * Slot for Stripe payment link: update pledge.payment_url after Checkout session is created.
 */
export const pledgeReminders: JobDefinition = {
  name: "pledge-reminders",
  schedule: "0 14 * * 1", // Mondays 14:00 UTC — run once domain is live
  async run() {
    // TODO: query pledges where status='pledged' and pledged_at < now() - interval '7 days'
    // and send a reminder email via Resend.
    return { ok: true, skipped: "not yet implemented" };
  },
};
