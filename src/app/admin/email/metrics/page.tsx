import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "Email Metrics — Utah Rugby Alumni Network Admin",
};

export default async function EmailMetricsPage() {
  const supabase = createAdminClient();

  const { data: sends } = await supabase
    .from("email_sends")
    .select("*")
    .order("sent_at", { ascending: false });

  // Aggregate by campaign
  const campaigns = new Map<
    string,
    { sent: number; opened: number; clicked: number }
  >();

  for (const send of sends ?? []) {
    const stats = campaigns.get(send.campaign) ?? {
      sent: 0,
      opened: 0,
      clicked: 0,
    };
    stats.sent++;
    if (send.opened_at) stats.opened++;
    if (send.clicked_at) stats.clicked++;
    campaigns.set(send.campaign, stats);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Email Metrics</h1>

      {/* Campaign summary */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {Array.from(campaigns.entries()).map(([campaign, stats]) => {
          const openRate =
            stats.sent > 0
              ? Math.round((stats.opened / stats.sent) * 100)
              : 0;
          const clickRate =
            stats.sent > 0
              ? Math.round((stats.clicked / stats.sent) * 100)
              : 0;

          return (
            <Card key={campaign}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {campaign.replace("_", " ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{stats.sent}</p>
                    <p className="text-xs text-muted-foreground">Sent</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{openRate}%</p>
                    <p className="text-xs text-muted-foreground">Opened</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{clickRate}%</p>
                    <p className="text-xs text-muted-foreground">Clicked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {campaigns.size === 0 && (
          <p className="text-muted-foreground col-span-3">
            No emails sent yet.
          </p>
        )}
      </div>

      {/* Per-recipient detail */}
      <h2 className="text-lg font-semibold mb-3">Recent Sends</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Clicked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(sends ?? []).slice(0, 100).map((send) => (
              <TableRow key={send.id}>
                <TableCell className="text-xs">
                  {send.recipient_email}
                </TableCell>
                <TableCell>
                  <span className="text-xs">
                    {send.campaign.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(send.sent_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-xs">
                  {send.opened_at
                    ? new Date(send.opened_at).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="text-xs">
                  {send.clicked_at
                    ? new Date(send.clicked_at).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
            {(!sends || sends.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No emails sent yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
