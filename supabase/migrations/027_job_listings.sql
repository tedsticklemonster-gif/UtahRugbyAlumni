-- Job listings table for alumni hiring
create table if not exists job_listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  alumni_id uuid references alumni(id) on delete cascade not null,
  title text not null,
  company text not null,
  location text,
  remote boolean not null default false,
  description text not null check (char_length(description) <= 2000),
  salary_range text,
  apply_url text,
  status text not null default 'active' check (status in ('active', 'closed', 'expired')),
  closed_at timestamptz
);

create index idx_job_listings_alumni on job_listings (alumni_id);
create index idx_job_listings_status on job_listings (status);

-- Bookmarks table for saving profiles
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  alumni_id uuid not null references alumni(id) on delete cascade,
  target_alumni_id uuid references alumni(id) on delete cascade,
  target_job_id uuid references job_listings(id) on delete cascade,
  unique(alumni_id, target_alumni_id),
  unique(alumni_id, target_job_id)
);
