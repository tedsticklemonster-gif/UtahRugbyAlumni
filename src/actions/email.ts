"use server";

import { render } from "@react-email/components";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import { MooseIntroEmail } from "@/emails/moose-intro";
import { ForwardShareEmail } from "@/emails/forward-share";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";

export type SendEmailState = {
  success: boolean;
  sent?: number;
  failed?: number;
  error?: string;
};

export async function sendEmailsAction(
  formData: FormData
): Promise<SendEmailState> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const campaign = formData.get("campaign") as string;
  const recipientIdsRaw = formData.get("recipientIds") as string;
  const recipientIds: string[] = JSON.parse(recipientIdsRaw);

  if (!campaign || recipientIds.length === 0) {
    return { success: false, error: "No campaign or recipients selected." };
  }

  const admin = createAdminClient();

  // Fetch recipient details
  const { data: recipients } = await admin
    .from("alumni")
    .select("id, first_name, last_name, email")
    .in("id", recipientIds)
    .not("email", "ilike", "%@placeholder.local%")
    .not("email", "ilike", "%@removed.local%");

  if (!recipients || recipients.length === 0) {
    return { success: false, error: "No valid recipients found." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alumni.utah-rugby.com";
  let sent = 0;
  let failed = 0;

  // FAIL SAFE: Process one at a time and log each send immediately.
  // If the batch crashes, we know exactly who was sent and who wasn't.
  for (const recipient of recipients) {
    // Check if already sent this campaign to this recipient
    const { data: existingSend } = await admin
      .from("email_sends")
      .select("id")
      .eq("alumni_id", recipient.id)
      .eq("campaign", campaign)
      .maybeSingle();

    if (existingSend) {
      // Already sent — skip to avoid duplicates
      continue;
    }

    let subject: string;
    let html: string;

    if (campaign === "moose_intro") {
      subject = "Hey it's Moose";
      html = await render(
        MooseIntroEmail({
          firstName: recipient.first_name,
          profileLink: `${appUrl}/join`,
          forwardLink: `${appUrl}/forward/generic`,
        })
      );
    } else if (campaign === "forward_share") {
      subject = "A fellow Utah Rugby alum thought you'd want to know about this";
      html = await render(
        ForwardShareEmail({
          referrerName: "A fellow alum",
          joinLink: `${appUrl}/join`,
        })
      );
    } else {
      failed++;
      continue;
    }

    try {
      const { data: sendResult } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: recipient.email,
        subject,
        html,
      });

      // Log the send immediately for resumability
      await admin.from("email_sends").insert({
        alumni_id: recipient.id,
        recipient_email: recipient.email,
        campaign,
        resend_id: sendResult?.id ?? null,
      });

      sent++;
    } catch (err) {
      console.error(`Failed to send to ${recipient.email}:`, err);
      failed++;
    }
  }

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "email.send",
    targetTable: "email_sends",
    payload: { campaign, sent, failed, total: recipientIds.length },
  });

  revalidatePath("/admin/email/metrics");
  return { success: true, sent, failed };
}
