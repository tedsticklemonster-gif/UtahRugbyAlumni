"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AlumniRow {
  id: string;
  first_name: string;
  last_name: string;
  grad_year: number | null;
  email: string;
  phone: string | null;
  status: string;
  verified: boolean;
  directory_visible: boolean;
  sms_consent: boolean;
  source: string | null;
  created_at: string;
}

interface RosterTableProps {
  alumni: AlumniRow[];
  onStatusChange: (ids: string[], status: string) => Promise<void>;
  onDelete: (
    ids: string[]
  ) => Promise<{ success: boolean; error?: string; deleted: number }>;
}

export function RosterTable({
  alumni,
  onStatusChange,
  onDelete,
}: RosterTableProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = alumni.filter((a) => {
    const matchesSearch =
      !search ||
      `${a.first_name} ${a.last_name} ${a.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  }

  function confirmDelete(ids: string[]) {
    setDeleteIds(ids);
    setDeleteOpen(true);
  }

  async function executeDelete() {
    setDeleting(true);
    const result = await onDelete(deleteIds);
    setDeleting(false);
    setDeleteOpen(false);
    setDeleteIds([]);
    if (result.success) {
      setSelectedIds(new Set());
    }
  }

  // Names of alumni about to be deleted (for the confirmation dialog)
  const deleteNames = deleteIds
    .map((id) => alumni.find((a) => a.id === id))
    .filter(Boolean)
    .map((a) => `${a!.first_name} ${a!.last_name}`);

  const statusColors: Record<string, string> = {
    self_registered: "default",
    imported: "secondary",
    needs_research: "outline",
    unreachable: "destructive",
    opted_out: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="self_registered">Self Registered</option>
          <option value="imported">Imported</option>
          <option value="needs_research">Needs Research</option>
          <option value="unreachable">Unreachable</option>
          <option value="opted_out">Opted Out</option>
        </select>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onStatusChange(Array.from(selectedIds), "unreachable")
              }
            >
              Mark Unreachable
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDelete(Array.from(selectedIds))}
            >
              <Trash2 className="size-3.5 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filtered.length && filtered.length > 0
                  }
                  onChange={toggleAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>SMS</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(a.id)}
                    onChange={() => toggleSelect(a.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {a.first_name} {a.last_name}
                </TableCell>
                <TableCell>{a.grad_year ?? "—"}</TableCell>
                <TableCell className="text-xs">{a.email}</TableCell>
                <TableCell className="text-xs">{a.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      (statusColors[a.status] as
                        | "default"
                        | "secondary"
                        | "outline"
                        | "destructive") ?? "secondary"
                    }
                    className="text-xs"
                  >
                    {a.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{a.verified ? "Yes" : "No"}</TableCell>
                <TableCell>{a.directory_visible ? "Yes" : "No"}</TableCell>
                {/* SMS CONSENT: Display only. Never auto-enable. */}
                <TableCell>{a.sms_consent ? "Yes" : "No"}</TableCell>
                <TableCell className="text-xs">
                  {a.source ?? "—"}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => confirmDelete([a.id])}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No alumni found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {alumni.length} records
      </p>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alumni</DialogTitle>
            <DialogDescription>
              {deleteIds.length === 1
                ? `Are you sure you want to permanently delete ${deleteNames[0]}? This cannot be undone.`
                : `Are you sure you want to permanently delete ${deleteIds.length} alumni records? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {deleteIds.length > 1 && deleteIds.length <= 10 && (
            <ul className="text-sm text-muted-foreground list-disc pl-5 max-h-40 overflow-y-auto">
              {deleteNames.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
