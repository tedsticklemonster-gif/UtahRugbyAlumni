-- 017_events_admin.sql
-- Add cancelled_at to events and allow admins to update/delete any event.

alter table events
  add column if not exists cancelled_at timestamptz;

create index if not exists events_cancelled_at_idx
  on events (cancelled_at) where cancelled_at is not null;

-- Admin override: update or delete any event
create policy "Admin manage events"
  on events for all to authenticated
  using (is_admin())
  with check (is_admin());

-- Admin can read all event RSVPs
create policy "Admin read rsvps"
  on event_rsvps for select to authenticated
  using (is_admin());
