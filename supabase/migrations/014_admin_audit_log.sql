-- 014_admin_audit_log.sql
-- Append-only log of every admin mutation.
-- Inserted only via service-role (logAdminAction helper); read-only for admins.

create table admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references auth.users(id) on delete set null,
  actor_email  text not null,
  action       text not null,          -- e.g. 'alumni.status_change', 'email.send'
  target_table text,                   -- e.g. 'alumni', 'email_sends'
  target_id    text,                   -- stringified id(s) of affected row(s)
  payload      jsonb,                  -- action-specific detail (counts, params, etc.)
  created_at   timestamptz not null default now()
);

-- Chronological queries are the common case
create index admin_audit_log_created_at_idx on admin_audit_log (created_at desc);
-- Filter by actor
create index admin_audit_log_actor_idx on admin_audit_log (actor_id);
-- Filter by action type
create index admin_audit_log_action_idx on admin_audit_log (action);

alter table admin_audit_log enable row level security;

-- Admins can read all audit log entries
create policy "Admin read audit log"
  on admin_audit_log for select to authenticated
  using (is_admin());

-- Inserts happen only from the service-role client (logAdminAction helper).
-- No authenticated-role insert policy — this keeps the log append-only from the app side.
