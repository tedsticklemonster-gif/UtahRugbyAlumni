-- 015_job_runs.sql
-- Tracks scheduled job executions so the board can see what ran and when.

create table job_runs (
  id         uuid primary key default gen_random_uuid(),
  job_name   text not null,
  status     text not null check (status in ('running', 'success', 'error')),
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  result     jsonb        -- job-specific summary (counts, errors, etc.)
);

create index job_runs_job_name_idx on job_runs (job_name, started_at desc);

alter table job_runs enable row level security;

-- Admins can read job run history
create policy "Admin read job_runs"
  on job_runs for select to authenticated
  using (is_admin());

-- Inserts/updates happen only via service-role from job runners
