"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "self_registered", label: "Self-registered" },
  { value: "imported", label: "Imported" },
  { value: "needs_research", label: "Needs research" },
  { value: "unreachable", label: "Unreachable" },
  { value: "opted_out", label: "Opted out" },
];

export function RosterExportButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [includeNotes, setIncludeNotes] = useState(false);

  function handleExport() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (includeNotes) params.set("notes", "1");
    window.location.href = `/admin/roster/export?${params.toString()}`;
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Export CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Roster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs mb-1 block">Filter by status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-notes"
                checked={includeNotes}
                onCheckedChange={(v) => setIncludeNotes(!!v)}
              />
              <Label htmlFor="include-notes" className="text-sm cursor-pointer">
                Include notes column
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Download CSV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
