export const dynamic = "force-dynamic";

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

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const now = new Date();
  const oneWeekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch stats in parallel
  const [
    { count: totalAlumni },
    { count: verifiedCount },
    { count: signupsThisWeek },
    { count: emailsSentThisWeek },
    { data: emailStats },
  ] = await Promise.all([
    supabase
      .from("alumni")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("alumni")
      .select("*", { count: "exact", head: true })
      .eq("verified", true),
    supabase
      .from("alumni")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo),
    supabase
      .from("email_sends")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", oneWeekAgo),
    supabase
      .from("email_sends")
      .select("opened_at, clicked_at")
      .gte("sent_at", oneWeekAgo),
  ]);

  const opened = emailStats?.filter((e) => e.opened_at).length ?? 0;
  const totalSent = emailStats?.length ?? 0;
  const openRate =
    totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0;

  const stats = [
    { label: "Total Alumni", value: totalAlumni ?? 0 },
    { label: "Verified", value: verifiedCount ?? 0 },
    { label: "Signups (7d)", value: signupsThisWeek ?? 0 },
    { label: "Emails Sent (7d)", value: emailsSentThisWeek ?? 0 },
    { label: "Open Rate (7d)", value: `${openRate}%` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
