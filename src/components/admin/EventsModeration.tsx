"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import {
  cancelEventAction,
  uncancelEventAction,
  getEventRsvpsAction,
} from "@/actions/events-admin";

interface Event {
  id: string;
  title: string;
  kind: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  cancelled_at: string | null;
  deleted_at: string | null;
  created_at: string;
  creator: { id: string; first_name: string; last_name: string } | null;
}

interface EventsModerationProps {
  events: Event[];
  rsvpCounts: Record<string, number>;
  filter: string;
}

export function EventsModeration({
  events: initial,
  rsvpCounts,
  filter,
}: EventsModerationProps) {
  const [events, setEvents] = useState(initial);
  const [confirming, setConfirming] = useState<{
    id: string;
    action: "cancel" | "uncancel";
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirming) return;
    setLoading(true);
    const result =
      confirming.action === "cancel"
        ? await cancelEventAction(confirming.id)
        : await uncancelEventAction(confirming.id);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Action failed.");
      setConfirming(null);
      return;
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === confirming.id
          ? {
              ...e,
              cancelled_at:
                confirming.action === "cancel"
                  ? new Date().toISOString()
                  : null,
            }
          : e
      )
    );
    setConfirming(null);
  }

  async function handleExportRsvps(eventId: string, eventTitle: string) {
    setExportingId(eventId);
    const result = await getEventRsvpsAction(eventId);
    setExportingId(null);

    if (!result.success || !result.rsvps) {
      setError(result.error ?? "Export failed.");
      return;
    }

    const header = "Name,Email,Status,RSVP Date\n";
    const rows = result.rsvps
      .map(
        (r) =>
          `"${r.alumni_name}","${r.email}","${r.status}","${new Date(r.rsvp_at).toLocaleDateString()}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${eventTitle.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filters = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/events?filter=${f.key}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {events.length === 0 ? (
        <EmptyState
          title={`No ${filter} events`}
          description="Nothing to moderate here."
        />
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                event.cancelled_at ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{event.title}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize text-muted-foreground">
                    {event.kind}
                  </span>
                  {event.cancelled_at && (
                    <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold">
                      Cancelled
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.starts_at).toLocaleString()}
                  {event.location && ` · ${event.location}`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  By{" "}
                  {event.creator
                    ? `${event.creator.first_name} ${event.creator.last_name}`
                    : "Unknown"}{" "}
                  ·{" "}
                  {rsvpCounts[event.id] ?? 0} going
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={exportingId === event.id}
                  onClick={() => handleExportRsvps(event.id, event.title)}
                >
                  {exportingId === event.id ? "…" : "Export RSVPs"}
                </Button>
                {event.cancelled_at ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConfirming({ id: event.id, action: "uncancel" })
                    }
                  >
                    Reinstate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setConfirming({ id: event.id, action: "cancel" })
                    }
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={
          confirming?.action === "cancel"
            ? "Cancel this event?"
            : "Reinstate event?"
        }
        description={
          confirming?.action === "cancel"
            ? "The event will be marked cancelled and hidden from the upcoming list. RSVPs are preserved."
            : "The event will be visible again in the upcoming events list."
        }
        confirmLabel={confirming?.action === "cancel" ? "Cancel Event" : "Reinstate"}
        destructive={confirming?.action === "cancel"}
        loading={loading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
