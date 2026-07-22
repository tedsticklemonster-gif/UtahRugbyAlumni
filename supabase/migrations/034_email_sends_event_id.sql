-- The new_event dedup check in notifyNewEvent filtered email_sends by
-- campaign alone, so after the first event announcement every later event
-- skipped all previously-emailed alumni. Scope sends to an event so the
-- dedup can be per-event.
alter table email_sends add column if not exists event_id uuid references events(id) on delete set null;

create index if not exists idx_email_sends_event on email_sends (event_id) where event_id is not null;
