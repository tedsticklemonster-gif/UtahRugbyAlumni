"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./EmptyState";
import {
  updatePledgeStatusAction,
  sendThankYouAction,
  exportPledgesAction,
} from "@/actions/fundraising";

type PledgeStatus = "pledged" | "paid" | "declined" | "cancelled";

interface Pledge {
  id: string;
  donor_name: string;
  donor_email: string;
  amount_cents: number;
  status: PledgeStatus;
  payment_method: string | null;
  pledged_at: string;
  paid_at: string | null;
  notes: string | null;
  alumni_id: string | null;
  anonymous: boolean;
}

interface PledgeTableProps {
  pledges: Pledge[];
  campaignId: string;
}

const STATUS_COLORS: Record<PledgeStatus, string> = {
  pledged: "secondary",
  paid: "default",
  declined: "destructive",
  cancelled: "outline",
};

const PAYMENT_METHODS = [
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "other", label: "Other" },
];

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function PledgeTable({ pledges: initial, campaignId }: PledgeTableProps) {
  const router = useRouter();
  const [pledges, setPledges] = useState(initial);
  const [markingPaid, setMarkingPaid] = useState<Pledge | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [loading, setLoading] = useState(false);
  const [thankYouId, setThankYouId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkPaid() {
    if (!markingPaid) return;
    setLoading(true);
    const result = await updatePledgeStatusAction(
      markingPaid.id,
      campaignId,
      "paid",
      paymentMethod
    );
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Update failed.");
      setMarkingPaid(null);
      return;
    }
    setPledges((prev) =>
      prev.map((p) =>
        p.id === markingPaid.id
          ? { ...p, status: "paid", payment_method: paymentMethod, paid_at: new Date().toISOString() }
          : p
      )
    );
    setMarkingPaid(null);
    router.refresh();
  }

  async function handleStatusChange(pledge: Pledge, status: PledgeStatus) {
    setLoading(true);
    const result = await updatePledgeStatusAction(pledge.id, campaignId, status);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Update failed.");
      return;
    }
    setPledges((prev) =>
      prev.map((p) => (p.id === pledge.id ? { ...p, status } : p))
    );
    router.refresh();
  }

  async function handleSendThankYou(pledgeId: string) {
    setThankYouId(pledgeId);
    const result = await sendThankYouAction(pledgeId, campaignId);
    setThankYouId(null);
    if (!result.success) {
      setError(result.error ?? "Failed to send thank-you.");
    }
  }

  async function handleExport() {
    const result = await exportPledgesAction(campaignId);
    if (!result.success || !result.rows) {
      setError(result.error ?? "Export failed.");
      return;
    }
    const header =
      "Donor,Email,Amount,Status,Payment Method,Pledged,Paid,Notes\n";
    const rows = result.rows
      .map(
        (r) =>
          [
            r.donor_name,
            r.donor_email,
            r.amount,
            r.status,
            r.payment_method,
            r.pledged_at,
            r.paid_at,
            r.notes,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pledges-${campaignId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (pledges.length === 0) {
    return (
      <EmptyState
        title="No pledges yet"
        description="Use the button above to record the first pledge."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {pledges.length} pledge{pledges.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" variant="outline" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Donor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Method</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pledges.map((pledge) => (
              <tr key={pledge.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm">{pledge.donor_name}</p>
                    {pledge.anonymous && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                        Anon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{pledge.donor_email}</p>
                  {pledge.notes && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                      {pledge.notes}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2 font-semibold whitespace-nowrap">
                  {formatMoney(pledge.amount_cents)}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant={STATUS_COLORS[pledge.status] as "default" | "secondary" | "destructive" | "outline"}
                    className="capitalize"
                  >
                    {pledge.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground capitalize">
                  {pledge.payment_method ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                  {pledge.paid_at
                    ? `Paid ${new Date(pledge.paid_at).toLocaleDateString()}`
                    : new Date(pledge.pledged_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pledge.status === "pledged" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setPaymentMethod("check");
                            setMarkingPaid(pledge);
                          }}
                          disabled={loading}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-muted-foreground"
                          onClick={() => handleStatusChange(pledge, "declined")}
                          disabled={loading}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {pledge.status === "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleSendThankYou(pledge.id)}
                        disabled={thankYouId === pledge.id}
                      >
                        {thankYouId === pledge.id ? "Sending…" : "Send Thank-you"}
                      </Button>
                    )}
                    {(pledge.status === "declined" ||
                      pledge.status === "cancelled") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={() => handleStatusChange(pledge, "pledged")}
                        disabled={loading}
                      >
                        Reopen
                      </Button>
                    )}
                    {pledge.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => handleStatusChange(pledge, "cancelled")}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mark Paid dialog */}
      <Dialog
        open={!!markingPaid}
        onOpenChange={(v) => !v && setMarkingPaid(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Recording payment of{" "}
            <strong>{markingPaid ? formatMoney(markingPaid.amount_cents) : ""}</strong>{" "}
            from <strong>{markingPaid?.donor_name}</strong>.
          </p>
          <div>
            <Label htmlFor="pay-method" className="text-xs">Payment method</Label>
            <select
              id="pay-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMarkingPaid(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkPaid} disabled={loading}>
              {loading ? "Saving…" : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
