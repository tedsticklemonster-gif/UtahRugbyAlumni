-- 018_alumni_last_contacted.sql
-- Track when each alumnus was last sent an email.

alter table alumni
  add column if not exists last_contacted_at timestamptz;

-- Backfill from existing email_sends
update alumni a
set last_contacted_at = (
  select max(sent_at)
  from email_sends e
  where e.alumni_id = a.id
)
where exists (
  select 1 from email_sends e where e.alumni_id = a.id
);

-- Trigger: keep last_contacted_at in sync whenever a new email_send is inserted
create or replace function update_alumni_last_contacted()
returns trigger as $$
begin
  update alumni
  set last_contacted_at = NEW.sent_at
  where id = NEW.alumni_id
    and (last_contacted_at is null or last_contacted_at < NEW.sent_at);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_alumni_last_contacted
  after insert on email_sends
  for each row
  execute function update_alumni_last_contacted();

-- Index for "haven't contacted in 90 days" filter
create index if not exists alumni_last_contacted_at_idx
  on alumni (last_contacted_at);
