export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Admin Dashboard — Utah Rugby Alumni Network",
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  const [
    { count: totalAlumni },
    { count: registeredCount },
    { count: importedCount },
    { count: optedOutCount },
    { count: unreachableCount },
    { count: needsResearchCount },
    { count: verifiedCount },
    { count: signupsThisWeek },
    { count: emailsSentThisWeek },
    { data: emailStats },
    { data: pledgeStats },
    { count: staleCount },
    { count: upcomingEvents },
    { data: expiringAnnouncements },
  ] = await Promise.all([
    supabase.from("alumni").select("*", { count: "exact", head: true }),
    supabase.from("alumni").select("*", { count: "exact", head: true }).eq("status", "self_registered"),
    supabase.from("alumni").select("*", { count: "exact", head: true }).eq("status", "imported"),
    supabase.from("alumni").select("*", { count: "exact", head: true }).eq("status", "opted_out"),
    supabase.from("alumni").select("*", { count: "exact", head: true }).eq("status", "unreachable"),
    supabase.from("alumni").select("*", { count: "exact", head: true }).eq("status", "needs_research"),
    supabase.from("alumni").select("*", { count: "exact", head: true }).eq("verified", true),
    supabase.from("alumni").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo),
    supabase.from("email_sends").select("*", { count: "exact", head: true }).gte("sent_at", oneWeekAgo),
    supabase.from("email_sends").select("opened_at").gte("sent_at", oneWeekAgo),
    supabase.from("pledges").select("amount_cents, status").eq("status", "pledged"),
    supabase
      .from("alumni")
      .select("*", { count: "exact", head: true })
      .or(`last_contacted_at.is.null,last_contacted_at.lt.${ninetyDaysAgo}`)
      .in("status", ["imported", "self_registered"]),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("starts_at", nowIso)
      .is("cancelled_at", null)
      .is("deleted_at", null),
    supabase
      .from("announcements")
      .select("id, title, expires_at")
      .not("expires_at", "is", null)
      .lte("expires_at", new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .gte("expires_at", nowIso),
  ]);

  const opened = emailStats?.filter((e) => e.opened_at).length ?? 0;
  const totalSent = emailStats?.length ?? 0;
  const openRate = totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;

  const outstandingPledgesCents = (pledgeStats ?? []).reduce(
    (sum, p) => sum + (p.amount_cents ?? 0),
    0
  );

  const statusBreakdown = [
    { label: "Registered", count: registeredCount ?? 0 },
    { label: "Imported", count: importedCount ?? 0 },
    { label: "Opted Out", count: optedOutCount ?? 0 },
    { label: "Unreachable", count: unreachableCount ?? 0 },
    { label: "Needs Research", count: needsResearchCount ?? 0 },
  ].filter((s) => s.count > 0);

  const primaryStats = [
    {
      label: "Total Alumni",
      value: totalAlumni ?? 0,
      href: "/admin/roster",
      sub: statusBreakdown.map((s) => `${s.count} ${s.label}`).join(" · "),
    },
    { label: "Verified", value: verifiedCount ?? 0, href: "/admin/roster" },
    { label: "Signups (7d)", value: signupsThisWeek ?? 0, href: "/admin/roster" },
    { label: "Emails Sent (7d)", value: emailsSentThisWeek ?? 0, href: "/admin/email/metrics" },
    { label: "Open Rate (7d)", value: `${openRate}%`, href: "/admin/email/metrics" },
  ];

  const actionStats = [
    {
      label: "Outstanding Pledges",
      value: formatMoney(outstandingPledgesCents),
      sub: `${(pledgeStats ?? []).length} pledges awaiting payment`,
      href: "/admin/fundraising",
      highlight: outstandingPledgesCents > 0,
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents ?? 0,
      sub: "active events on the calendar",
      href: "/admin/events",
      highlight: false,
    },
    {
      label: "Not Contacted (90d+)",
      value: staleCount ?? 0,
      sub: "alumni due for outreach",
      href: "/admin/roster?stale=90",
      highlight: (staleCount ?? 0) > 0,
    },
    {
      label: "Announcements Expiring",
      value: (expiringAnnouncements ?? []).length,
      sub: "expiring within 7 days",
      href: "/admin/announcements",
      highlight: (expiringAnnouncements ?? []).length > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Primary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {primaryStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.sub && (
                  <p className="text-2xs text-muted-foreground mt-1 leading-tight">{stat.sub}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Action-oriented cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Needs Attention
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actionStats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card
                className={`hover:border-primary/50 transition-colors cursor-pointer ${
                  stat.highlight ? "border-amber-300 dark:border-amber-700" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.sub && (
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
