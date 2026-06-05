-- User blocking
create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  blocker_id uuid not null references alumni(id) on delete cascade,
  blocked_id uuid not null references alumni(id) on delete cascade,
  unique(blocker_id, blocked_id)
);

create index idx_blocks_blocker on blocks (blocker_id);

-- Content reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporter_id uuid not null references alumni(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'inappropriate', 'fake_profile', 'other')),
  details text,
  target_type text not null check (target_type in ('alumni', 'post', 'comment', 'event', 'message')),
  target_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_at timestamptz,
  reviewed_by uuid references alumni(id)
);

create index idx_reports_status on reports (status);
create index idx_reports_target on reports (target_type, target_id);
