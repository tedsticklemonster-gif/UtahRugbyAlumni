export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPage } from "@/components/admin/AdminPage";
import { EventsModeration } from "@/components/admin/EventsModeration";

export const metadata = { title: "Events — Admin" };

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "upcoming"; // upcoming | past | cancelled

  const admin = createAdminClient();
  const now = new Date().toISOString();

  let query = admin
    .from("events")
    .select(
      `id, title, kind, starts_at, ends_at, location, cancelled_at, deleted_at, created_at,
       creator:alumni!creator_id(id, first_name, last_name)`
    )
    .is("deleted_at", null)
    .order("starts_at", { ascending: filter !== "past" });

  if (filter === "upcoming") {
    query = query.gte("starts_at", now).is("cancelled_at", null);
  } else if (filter === "past") {
    query = query.lt("starts_at", now).is("cancelled_at", null);
  } else if (filter === "cancelled") {
    query = query.not("cancelled_at", "is", null);
  }

  const { data: events } = await query.limit(100);

  // Fetch RSVP counts in one query
  const eventIds = (events ?? []).map((e) => e.id);
  let rsvpCounts: Record<string, number> = {};

  if (eventIds.length > 0) {
    const { data: rsvps } = await admin
      .from("event_rsvps")
      .select("event_id, status")
      .in("event_id", eventIds)
      .eq("status", "going");

    (rsvps ?? []).forEach((r) => {
      rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] ?? 0) + 1;
    });
  }

  return (
    <AdminPage
      title="Events"
      description="Review and moderate member-created events."
    >
      <EventsModeration
        events={(events ?? []) as unknown as Parameters<typeof EventsModeration>[0]["events"]}
        rsvpCounts={rsvpCounts}
        filter={filter}
      />
    </AdminPage>
  );
}
