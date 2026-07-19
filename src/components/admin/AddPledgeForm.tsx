"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPledgeAction, type PledgeFormData } from "@/actions/fundraising";

const PAYMENT_METHODS = [
  { value: "", label: "— Not yet paid —" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "other", label: "Other" },
];

interface AddPledgeFormProps {
  campaignId: string;
}

const EMPTY: {
  donor_name: string;
  donor_email: string;
  amount_dollars: string;
  payment_method: string;
  notes: string;
  anonymous: boolean;
} = {
  donor_name: "",
  donor_email: "",
  amount_dollars: "",
  payment_method: "",
  notes: "",
  anonymous: false,
};

export function AddPledgeForm({ campaignId }: AddPledgeFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setForm(EMPTY);
    setError(null);
  }

  async function handleSave() {
    if (!form.donor_name.trim()) {
      setError("Donor name is required.");
      return;
    }
    if (!form.donor_email.trim() || !form.donor_email.includes("@")) {
      setError("A valid email is required.");
      return;
    }
    const dollars = parseFloat(form.amount_dollars);
    if (isNaN(dollars) || dollars <= 0) {
      setError("Amount must be greater than $0.");
      return;
    }

    setSaving(true);
    setError(null);

    const data: PledgeFormData = {
      donor_name: form.donor_name,
      donor_email: form.donor_email,
      amount_cents: Math.round(dollars * 100),
      payment_method: form.payment_method || null,
      notes: form.notes,
      alumni_id: null,
      anonymous: form.anonymous,
    };

    const result = await createPledgeAction(campaignId, data);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <Button size="sm" onClick={() => { reset(); setOpen(true); }}>
        + Add Pledge
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pledge</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="p-name" className="text-xs">Donor name *</Label>
                <Input
                  id="p-name"
                  value={form.donor_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, donor_name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-email" className="text-xs">Email *</Label>
                <Input
                  id="p-email"
                  type="email"
                  value={form.donor_email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, donor_email: e.target.value }))
                  }
                  placeholder="jane@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="p-amount" className="text-xs">Amount ($) *</Label>
                <Input
                  id="p-amount"
                  type="number"
                  min="1"
                  step="25"
                  value={form.amount_dollars}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount_dollars: e.target.value }))
                  }
                  placeholder="250"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-method" className="text-xs">Payment method</Label>
                <select
                  id="p-method"
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, payment_method: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="p-notes" className="text-xs">Notes</Label>
              <Textarea
                id="p-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
                placeholder="Optional notes about this pledge"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="p-anon"
                checked={form.anonymous}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, anonymous: !!v }))
                }
              />
              <Label htmlFor="p-anon" className="text-sm cursor-pointer font-normal">
                Donor wishes to remain anonymous (won&apos;t show on their profile)
              </Label>
            </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Add Pledge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
