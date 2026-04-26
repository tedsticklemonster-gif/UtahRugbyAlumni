-- 016_announcements_fields.sql
-- Add pinned flag and optional expiry to announcements.

alter table announcements
  add column if not exists pinned     boolean not null default false,
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Index so the feed can efficiently hide expired announcements
create index if not exists announcements_expires_at_idx
  on announcements (expires_at) where expires_at is not null;
