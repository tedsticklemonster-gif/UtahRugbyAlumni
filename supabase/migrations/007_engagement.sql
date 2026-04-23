-- 007_engagement.sql
-- Alumni handle slug for @mentions (Phase 2) and public profiles.
-- Announcements table for admin-pinned messages shown in the Hub.

-- ── Alumni handle ──────────────────────────────────────────────────────────────
alter table alumni add column if not exists handle text;

-- Backfill: lower(first_name || last_name), strip non-alphanumeric
update alumni
set handle = lower(regexp_replace(first_name || last_name, '[^a-zA-Z0-9]', '', 'g'))
where handle is null;

-- De-duplicate: append row-number suffix for collisions
with dupes as (
  select id,
         handle,
         row_number() over (partition by handle order by created_at) as rn
  from alumni
  where handle is not null
)
update alumni
set handle = alumni.handle || dupes.rn::text
from dupes
where alumni.id = dupes.id and dupes.rn > 1;

alter table alumni add constraint if not exists alumni_handle_unique unique (handle);

-- ── Announcements ──────────────────────────────────────────────────────────────
create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  pinned     boolean not null default false,
  created_by uuid references alumni(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "Admin manage announcements"
  on announcements for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "Verified alumni read announcements"
  on announcements for select to authenticated
  using (true);
