"use client";

import { useState } from "react";
import { sendEmailsAction, type SendEmailState } from "@/actions/email";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Recipient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  grad_year: number | null;
}

interface EmailSendFormProps {
  allAlumni: Recipient[];
}

export function EmailSendForm({ allAlumni }: EmailSendFormProps) {
  const [campaign, setCampaign] = useState("moose_intro");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendEmailState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filtered = allAlumni.filter((a) => {
    // Exclude placeholder/deleted emails
    if (a.email.includes("@placeholder.local")) return false;
    if (a.email.includes("@removed.local")) return false;
    // Status filter
    if (statusFilter && a.status !== statusFilter) return false;
    // Year range
    if (yearFrom && a.grad_year && a.grad_year < parseInt(yearFrom))
      return false;
    if (yearTo && a.grad_year && a.grad_year > parseInt(yearTo)) return false;
    return true;
  });

  // Preview: show first recipient
  const previewRecipient = filtered[0];

  async function handleSend() {
    setSending(true);
    setConfirmOpen(false);

    const fd = new FormData();
    fd.set("campaign", campaign);
    fd.set("recipientIds", JSON.stringify(filtered.map((r) => r.id)));

    const res = await sendEmailsAction(fd);
    setResult(res);
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Emails</CardTitle>
          <CardDescription>
            Select a template and filter recipients. Each recipient receives at
            most one email per campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value="moose_intro">
                Moose Intro — &quot;Hey it&apos;s Moose&quot;
              </option>
              <option value="forward_share">Forward Share</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-sm"
              >
                <option value="">All with email</option>
                <option value="self_registered">Self Registered</option>
                <option value="imported">Imported</option>
                <option value="needs_research">Needs Research</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Year from</Label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                placeholder="1960"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Year to</Label>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                placeholder={String(new Date().getFullYear())}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <strong>{filtered.length}</strong> recipients match your filters.
            {previewRecipient && (
              <>
                {" "}
                Preview: {previewRecipient.first_name}{" "}
                {previewRecipient.last_name} ({previewRecipient.email})
              </>
            )}
          </p>

          <Button
            disabled={filtered.length === 0 || sending}
            onClick={() => setConfirmOpen(true)}
          >
            {sending
              ? "Sending..."
              : `Send to ${filtered.length} Recipients`}
          </Button>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Send</DialogTitle>
                <DialogDescription>
                  You are about to send the &quot;{campaign}&quot; email to{" "}
                  <strong>{filtered.length}</strong> recipients. This cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSend}>
                  Yes, Send {filtered.length} Emails
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            {result.error ? (
              <p className="text-sm text-destructive">{result.error}</p>
            ) : (
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-green-800">
                    {result.sent}
                  </p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                {(result.failed ?? 0) > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-red-800">
                      {result.failed}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
