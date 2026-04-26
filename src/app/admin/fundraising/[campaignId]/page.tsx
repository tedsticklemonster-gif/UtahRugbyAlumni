export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { PledgeTable } from "@/components/admin/PledgeTable";
import { AddPledgeForm } from "@/components/admin/AddPledgeForm";

export const metadata = { title: "Campaign — Admin" };

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const admin = createAdminClient();

  const { data: campaign } = await admin
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (!campaign) notFound();

  const { data: pledges } = await admin
    .from("pledges")
    .select("id, donor_name, donor_email, amount_cents, status, payment_method, pledged_at, paid_at, notes, alumni_id, anonymous")
    .eq("campaign_id", campaignId)
    .order("pledged_at", { ascending: false });

  // Tally by status
  const rows = pledges ?? [];
  const totals = rows.reduce(
    (acc, p) => {
      if (p.status === "pledged") {
        acc.pledged += p.amount_cents;
        acc.pledgedCount++;
      } else if (p.status === "paid") {
        acc.paid += p.amount_cents;
        acc.paidCount++;
      }
      return acc;
    },
    { pledged: 0, pledgedCount: 0, paid: 0, paidCount: 0 }
  );

  const goalCents = campaign.goal_cents;
  const paidPct =
    goalCents && goalCents > 0
      ? Math.min(100, Math.round((totals.paid / goalCents) * 100))
      : null;
  const pledgedPct =
    goalCents && goalCents > 0
      ? Math.min(100, Math.round(((totals.paid + totals.pledged) / goalCents) * 100))
      : null;

  return (
    <AdminPage
      title={campaign.name}
      description={campaign.description ?? undefined}
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/fundraising"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← All campaigns
          </Link>
          <CampaignForm mode="edit" campaign={campaign} />
        </div>
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Paid", value: formatMoney(totals.paid), sub: `${totals.paidCount} donors` },
          { label: "Outstanding", value: formatMoney(totals.pledged), sub: `${totals.pledgedCount} pledges` },
          { label: "Total committed", value: formatMoney(totals.paid + totals.pledged), sub: "paid + pledged" },
          {
            label: goalCents ? "Goal" : "No goal set",
            value: goalCents ? formatMoney(goalCents) : "—",
            sub: paidPct !== null ? `${paidPct}% paid` : "",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
            {s.sub && <p className="text-[10px] text-muted-foreground">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {goalCents && (
        <div className="space-y-1">
          <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
            {pledgedPct !== null && pledgedPct > 0 && (
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-200 dark:bg-emerald-900 transition-all"
                style={{ width: `${pledgedPct}%` }}
              />
            )}
            {paidPct !== null && paidPct > 0 && (
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${paidPct}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{paidPct}% paid · {pledgedPct}% committed</span>
            <span>Goal: {formatMoney(goalCents)}</span>
          </div>
        </div>
      )}

      {/* Add pledge */}
      <AddPledgeForm campaignId={campaignId} />

      {/* Pledge table */}
      <PledgeTable pledges={rows} campaignId={campaignId} />
    </AdminPage>
  );
}
