-- Recurring events support
alter table events add column if not exists recurrence_rule text
  check (recurrence_rule is null or recurrence_rule in ('weekly', 'biweekly', 'monthly', 'annual'));

alter table events add column if not exists recurrence_end date;

alter table events add column if not exists series_id uuid references events(id) on delete set null;

create index if not exists idx_events_series on events (series_id) where series_id is not null;
