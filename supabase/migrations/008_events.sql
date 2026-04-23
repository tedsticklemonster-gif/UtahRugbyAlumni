-- 008_events.sql
-- Alumni-created events with RSVPs.

create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references alumni(id) on delete cascade,
  title        text not null,
  description  text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  location     text,
  location_url text,
  photo_url    text,
  kind         text not null default 'social'
               check (kind in ('social','reunion','watch_party','practice','other')),
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists event_rsvps (
  event_id   uuid not null references events(id) on delete cascade,
  alumni_id  uuid not null references alumni(id) on delete cascade,
  status     text not null check (status in ('going','maybe','no')),
  created_at timestamptz not null default now(),
  primary key (event_id, alumni_id)
);

alter table events enable row level security;
alter table event_rsvps enable row level security;

-- Verified alumni can create and read events
create policy "Verified alumni read events"
  on events for select to authenticated
  using (deleted_at is null);

create policy "Verified alumni create events"
  on events for insert to authenticated
  with check (
    exists (select 1 from alumni where id = creator_id and verified = true)
  );

create policy "Creator updates own event"
  on events for update to authenticated
  using (creator_id = (select id from alumni where email = auth.jwt()->>'email'));

-- RSVPs
create policy "Verified alumni read rsvps"
  on event_rsvps for select to authenticated
  using (true);

create policy "Alumni manage own rsvp"
  on event_rsvps for all to authenticated
  using (alumni_id = (select id from alumni where email = auth.jwt()->>'email'))
  with check (alumni_id = (select id from alumni where email = auth.jwt()->>'email'));

-- Index for listing upcoming events
create index if not exists events_starts_at_idx on events(starts_at) where deleted_at is null;
