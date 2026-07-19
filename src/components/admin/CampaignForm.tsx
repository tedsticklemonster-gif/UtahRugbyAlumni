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
import {
  createCampaignAction,
  updateCampaignAction,
  type CampaignFormData,
} from "@/actions/fundraising";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  goal_cents: number | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
}

interface CampaignFormProps {
  mode: "create" | "edit";
  campaign?: Campaign;
}

function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

export function CampaignForm({ mode, campaign }: CampaignFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    goal_dollars: string;
    starts_at: string;
    ends_at: string;
    active: boolean;
  }>({
    name: campaign?.name ?? "",
    description: campaign?.description ?? "",
    goal_dollars:
      campaign?.goal_cents ? String(campaign.goal_cents / 100) : "",
    starts_at: toDateInput(campaign?.starts_at ?? null),
    ends_at: toDateInput(campaign?.ends_at ?? null),
    active: campaign?.active ?? true,
  });

  function reset() {
    setForm({
      name: campaign?.name ?? "",
      description: campaign?.description ?? "",
      goal_dollars: campaign?.goal_cents
        ? String(campaign.goal_cents / 100)
        : "",
      starts_at: toDateInput(campaign?.starts_at ?? null),
      ends_at: toDateInput(campaign?.ends_at ?? null),
      active: campaign?.active ?? true,
    });
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Campaign name is required.");
      return;
    }
    const goalDollars = parseFloat(form.goal_dollars);
    if (form.goal_dollars && (isNaN(goalDollars) || goalDollars <= 0)) {
      setError("Goal must be a positive dollar amount.");
      return;
    }

    setSaving(true);
    setError(null);

    const data: CampaignFormData = {
      name: form.name,
      description: form.description,
      goal_cents: form.goal_dollars
        ? Math.round(goalDollars * 100)
        : null,
      starts_at: form.starts_at
        ? new Date(form.starts_at).toISOString()
        : null,
      ends_at: form.ends_at
        ? new Date(form.ends_at).toISOString()
        : null,
      active: form.active,
    };

    const result =
      mode === "edit" && campaign
        ? await updateCampaignAction(campaign.id, data)
        : await createCampaignAction(data);

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    setOpen(false);
    if (mode === "create" && "id" in result && result.id) {
      router.push(`/admin/fundraising/${result.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant={mode === "edit" ? "outline" : "default"}
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        {mode === "edit" ? "Edit Campaign" : "+ New Campaign"}
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Edit Campaign" : "New Campaign"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div>
              <Label htmlFor="c-name" className="text-xs">Name *</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Spring 2025 Fund Drive"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="c-desc" className="text-xs">Description</Label>
              <Textarea
                id="c-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                placeholder="Optional campaign description"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="c-goal" className="text-xs">Goal ($)</Label>
              <Input
                id="c-goal"
                type="number"
                min="0"
                step="50"
                value={form.goal_dollars}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goal_dollars: e.target.value }))
                }
                placeholder="Leave blank for no goal"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-start" className="text-xs">Start date</Label>
                <input
                  id="c-start"
                  type="date"
                  value={form.starts_at}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, starts_at: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="c-end" className="text-xs">End date</Label>
                <input
                  id="c-end"
                  type="date"
                  value={form.ends_at}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ends_at: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="c-active"
                checked={form.active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, active: !!v }))
                }
              />
              <Label htmlFor="c-active" className="text-sm cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
