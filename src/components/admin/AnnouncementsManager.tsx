"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  type AnnouncementFormData,
} from "@/actions/announcements";

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface AnnouncementsManagerProps {
  announcements: Announcement[];
}

const EMPTY_FORM: AnnouncementFormData = {
  title: "",
  body: "",
  pinned: false,
  expires_at: null,
};

export function AnnouncementsManager({
  announcements: initial,
}: AnnouncementsManagerProps) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState<AnnouncementFormData>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(item: Announcement) {
    setForm({
      title: item.title,
      body: item.body,
      pinned: item.pinned,
      expires_at: item.expires_at
        ? item.expires_at.slice(0, 16) // trim to datetime-local format
        : null,
    });
    setEditing(item.id);
    setShowForm(true);
    setError(null);
  }

  function cancel() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload: AnnouncementFormData = {
      ...form,
      expires_at: form.expires_at
        ? new Date(form.expires_at).toISOString()
        : null,
    };

    const result = editing
      ? await updateAnnouncementAction(editing, payload)
      : await createAnnouncementAction(payload);

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    // Optimistic update — page will also revalidate server-side
    if (editing) {
      setItems((prev) =>
        prev.map((a) =>
          a.id === editing
            ? {
                ...a,
                ...payload,
                expires_at: payload.expires_at,
                updated_at: new Date().toISOString(),
              }
            : a
        )
      );
    } else {
      // Reload to get real id from server — simplest approach
      window.location.reload();
      return;
    }
    cancel();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteAnnouncementAction(deleting);
    setDeleteLoading(false);
    if (!result.success) {
      setError(result.error ?? "Delete failed.");
      setDeleting(null);
      return;
    }
    setItems((prev) => prev.filter((a) => a.id !== deleting));
    setDeleting(null);
  }

  const deletingItem = items.find((a) => a.id === deleting);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm">
          + New Announcement
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            {editing ? "Edit Announcement" : "New Announcement"}
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ann-title" className="text-xs">
                Title
              </Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Spring Reunion Save the Date"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ann-body" className="text-xs">
                Body
              </Label>
              <Textarea
                id="ann-body"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Announcement details…"
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ann-pinned"
                  checked={form.pinned}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, pinned: !!v }))
                  }
                />
                <Label htmlFor="ann-pinned" className="text-xs cursor-pointer">
                  Pin to top of feed
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="ann-expires" className="text-xs">
                  Expires
                </Label>
                <input
                  id="ann-expires"
                  type="datetime-local"
                  value={form.expires_at ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      expires_at: e.target.value || null,
                    }))
                  }
                  className="rounded-lg border bg-background px-2 py-1 text-xs"
                />
                {form.expires_at && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, expires_at: null }))}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <EmptyState
          title="No announcements yet"
          description="Create one to broadcast a message to all members."
          action={
            <Button size="sm" onClick={openCreate}>
              + New Announcement
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-background p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.pinned && (
                    <span className="rounded-full bg-warning/12 text-warning px-2 py-0.5 text-2xs font-semibold">
                      Pinned
                    </span>
                  )}
                  {item.expires_at && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-2xs text-muted-foreground">
                      Expires {new Date(item.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.body}
                </p>
                <p className="text-2xs text-muted-foreground">
                  Created {new Date(item.created_at).toLocaleDateString()}
                  {item.updated_at &&
                    item.updated_at !== item.created_at &&
                    ` · Updated ${new Date(item.updated_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleting(item.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete announcement?"
        description={`"${deletingItem?.title ?? ""}" will be permanently removed from the feed.`}
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
