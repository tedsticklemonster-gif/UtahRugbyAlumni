"use server";

import { render } from "@react-email/components";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminAction } from "@/lib/audit";
import { getResend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import { PledgeThankYouEmail } from "@/emails/pledge-thank-you";
import { unsubscribeUrl } from "@/lib/unsubscribe-token";

// ── Campaigns ───────────────────────────────────────────────────────────────

export interface CampaignFormData {
  name: string;
  description: string;
  goal_cents: number | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
}

export async function createCampaignAction(
  data: CampaignFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("campaigns")
    .insert({
      name: data.name.trim(),
      description: data.description.trim() || null,
      goal_cents: data.goal_cents,
      starts_at: data.starts_at || null,
      ends_at: data.ends_at || null,
      active: data.active,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "campaign.create",
    targetTable: "campaigns",
    targetId: row.id,
    payload: { name: data.name },
  });

  revalidatePath("/admin/fundraising");
  return { success: true, id: row.id };
}

export async function updateCampaignAction(
  id: string,
  data: CampaignFormData
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("campaigns")
    .update({
      name: data.name.trim(),
      description: data.description.trim() || null,
      goal_cents: data.goal_cents,
      starts_at: data.starts_at || null,
      ends_at: data.ends_at || null,
      active: data.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "campaign.update",
    targetTable: "campaigns",
    targetId: id,
    payload: { name: data.name },
  });

  revalidatePath("/admin/fundraising");
  revalidatePath(`/admin/fundraising/${id}`);
  return { success: true };
}

// ── Pledges ─────────────────────────────────────────────────────────────────

export interface PledgeFormData {
  donor_name: string;
  donor_email: string;
  amount_cents: number;
  payment_method: string | null;
  notes: string;
  alumni_id: string | null;
  anonymous: boolean;
}

export async function createPledgeAction(
  campaignId: string,
  data: PledgeFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();

  // Auto-link to an alumni record by email if not explicitly provided
  let alumniId = data.alumni_id || null;
  if (!alumniId && !data.anonymous) {
    const { data: match } = await admin
      .from("alumni")
      .select("id")
      .ilike("email", data.donor_email.trim())
      .maybeSingle();
    if (match) alumniId = match.id;
  }

  const { data: row, error } = await admin
    .from("pledges")
    .insert({
      campaign_id: campaignId,
      alumni_id: alumniId,
      donor_name: data.donor_name.trim(),
      donor_email: data.donor_email.trim().toLowerCase(),
      amount_cents: data.amount_cents,
      payment_method: data.payment_method || null,
      notes: data.notes.trim() || null,
      anonymous: data.anonymous,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "pledge.create",
    targetTable: "pledges",
    targetId: row.id,
    payload: {
      campaign_id: campaignId,
      donor: data.donor_name,
      amount_cents: data.amount_cents,
    },
  });

  revalidatePath(`/admin/fundraising/${campaignId}`);
  return { success: true, id: row.id };
}

export async function updatePledgeStatusAction(
  pledgeId: string,
  campaignId: string,
  status: "pledged" | "paid" | "declined" | "cancelled",
  paymentMethod?: string
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("pledges")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      payment_method: paymentMethod || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pledgeId);

  if (error) return { success: false, error: error.message };

  await logAdminAction({
    actorId: actor.id,
    actorEmail: actor.email!,
    action: "pledge.update",
    targetTable: "pledges",
    targetId: pledgeId,
    payload: { status, payment_method: paymentMethod },
  });

  revalidatePath(`/admin/fundraising/${campaignId}`);
  return { success: true };
}

export async function sendThankYouAction(
  pledgeId: string,
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();

  // Fetch pledge + campaign details
  const { data: pledge } = await admin
    .from("pledges")
    .select("donor_name, donor_email, amount_cents, payment_method, campaign_id, alumni_id")
    .eq("id", pledgeId)
    .maybeSingle();

  if (!pledge) return { success: false, error: "Pledge not found." };

  const { data: campaign } = await admin
    .from("campaigns")
    .select("name")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign) return { success: false, error: "Campaign not found." };

  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(pledge.amount_cents / 100);

  const html = await render(
    PledgeThankYouEmail({
      donorName: pledge.donor_name,
      campaignName: campaign.name,
      amountFormatted,
      paymentMethod: pledge.payment_method ?? "your generous contribution",
      unsubscribeUrl: pledge.alumni_id ? unsubscribeUrl(pledge.alumni_id) : undefined,
    })
  );

  try {
    const { data: sendResult } = await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: pledge.donor_email,
      subject: `Thank you for supporting ${campaign.name}`,
      html,
    });

    // Log the send
    await admin.from("email_sends").insert({
      alumni_id: null,
      recipient_email: pledge.donor_email,
      campaign: "thank_you",
      resend_id: sendResult?.id ?? null,
    });

    await logAdminAction({
      actorId: actor.id,
      actorEmail: actor.email!,
      action: "email.send",
      targetTable: "email_sends",
      payload: {
        campaign: "thank_you",
        recipient: pledge.donor_email,
        pledge_id: pledgeId,
      },
    });
  } catch (err) {
    return { success: false, error: String(err) };
  }

  revalidatePath(`/admin/fundraising/${campaignId}`);
  return { success: true };
}

// ── CSV export ───────────────────────────────────────────────────────────────

export interface PledgeExportRow {
  donor_name: string;
  donor_email: string;
  amount: string;
  status: string;
  payment_method: string;
  pledged_at: string;
  paid_at: string;
  notes: string;
}

export async function exportPledgesAction(
  campaignId: string
): Promise<{ success: boolean; rows?: PledgeExportRow[]; error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pledges")
    .select(
      "donor_name, donor_email, amount_cents, status, payment_method, pledged_at, paid_at, notes"
    )
    .eq("campaign_id", campaignId)
    .order("pledged_at", { ascending: true });

  if (error) return { success: false, error: error.message };

  const rows: PledgeExportRow[] = (data ?? []).map((p) => ({
    donor_name: p.donor_name,
    donor_email: p.donor_email,
    amount: `$${(p.amount_cents / 100).toFixed(2)}`,
    status: p.status,
    payment_method: p.payment_method ?? "",
    pledged_at: p.pledged_at
      ? new Date(p.pledged_at).toLocaleDateString()
      : "",
    paid_at: p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "",
    notes: p.notes ?? "",
  }));

  return { success: true, rows };
}
