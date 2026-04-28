-- Event photo albums: multiple photos per event
create table if not exists event_photos (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  alumni_id    uuid not null references alumni(id) on delete cascade,
  storage_path text not null,
  caption      text check (char_length(caption) <= 200),
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index idx_event_photos_event on event_photos (event_id, created_at);

-- RLS
alter table event_photos enable row level security;

-- Anyone authenticated can view photos for non-deleted events
create policy event_photos_select on event_photos for select
  using (deleted_at is null);

-- Verified alumni can upload photos
create policy event_photos_insert on event_photos for insert
  with check (
    alumni_id = (select id from alumni where email = auth.email() and verified = true)
  );

-- Photo uploader can soft-delete their own photos
create policy event_photos_delete on event_photos for update
  using (
    alumni_id = (select id from alumni where email = auth.email())
  )
  with check (deleted_at is not null);
