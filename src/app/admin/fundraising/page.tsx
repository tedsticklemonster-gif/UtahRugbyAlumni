export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { EmptyState } from "@/components/admin/EmptyState";
import { CampaignForm } from "@/components/admin/CampaignForm";

export const metadata = { title: "Fundraising — Admin" };

function formatGoal(cents: number | null) {
  if (!cents) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function FundraisingPage() {
  const admin = createAdminClient();

  // Campaigns with pledge totals
  const { data: campaigns } = await admin
    .from("campaigns")
    .select("id, name, description, goal_cents, active, starts_at, ends_at, created_at")
    .order("created_at", { ascending: false });

  const campaignIds = (campaigns ?? []).map((c) => c.id);
  const pledgeTotals: Record<string, { pledged: number; paid: number; count: number }> = {};

  if (campaignIds.length > 0) {
    const { data: pledges } = await admin
      .from("pledges")
      .select("campaign_id, amount_cents, status")
      .in("campaign_id", campaignIds)
      .not("status", "eq", "cancelled");

    (pledges ?? []).forEach((p) => {
      if (!pledgeTotals[p.campaign_id]) {
        pledgeTotals[p.campaign_id] = { pledged: 0, paid: 0, count: 0 };
      }
      pledgeTotals[p.campaign_id].count++;
      if (p.status === "pledged" || p.status === "paid") {
        pledgeTotals[p.campaign_id].pledged += p.amount_cents;
      }
      if (p.status === "paid") {
        pledgeTotals[p.campaign_id].paid += p.amount_cents;
      }
    });
  }

  return (
    <AdminPage
      title="Fundraising"
      description="Track campaigns and donor pledges."
      action={<CampaignForm mode="create" />}
    >
      {(campaigns ?? []).length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create your first fundraising campaign to start tracking pledges."
        />
      ) : (
        <div className="space-y-3">
          {(campaigns ?? []).map((campaign) => {
            const totals = pledgeTotals[campaign.id] ?? {
              pledged: 0,
              paid: 0,
              count: 0,
            };
            const goalCents = campaign.goal_cents;
            const paidPct =
              goalCents && goalCents > 0
                ? Math.min(100, Math.round((totals.paid / goalCents) * 100))
                : null;
            const pledgedPct =
              goalCents && goalCents > 0
                ? Math.min(100, Math.round((totals.pledged / goalCents) * 100))
                : null;

            return (
              <Link
                key={campaign.id}
                href={`/admin/fundraising/${campaign.id}`}
                className="block rounded-lg border bg-background p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{campaign.name}</p>
                      {!campaign.active && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {campaign.description}
                      </p>
                    )}
                    {/* Progress bar */}
                    {goalCents && (
                      <div className="mt-2 space-y-1">
                        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                          {/* Pledged bar (lighter) */}
                          {pledgedPct !== null && pledgedPct > 0 && (
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-emerald-200 dark:bg-emerald-900"
                              style={{ width: `${pledgedPct}%` }}
                            />
                          )}
                          {/* Paid bar (solid) */}
                          {paidPct !== null && paidPct > 0 && (
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                              style={{ width: `${paidPct}%` }}
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {formatGoal(totals.paid)} paid ·{" "}
                          {formatGoal(totals.pledged)} pledged of{" "}
                          {formatGoal(goalCents)} goal
                        </p>
                      </div>
                    )}
                    {!goalCents && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {totals.count} pledge{totals.count !== 1 ? "s" : ""} ·{" "}
                        {formatGoal(totals.paid) ?? "$0"} collected
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}
