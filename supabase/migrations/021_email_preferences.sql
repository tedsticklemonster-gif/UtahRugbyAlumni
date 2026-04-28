-- Add email preferences column for granular notification control
alter table alumni add column if not exists email_preferences jsonb not null default '{}';

-- Expand email_sends campaign constraint to include new_event and event_reminder
alter table email_sends drop constraint if exists email_sends_campaign_check;
alter table email_sends add constraint email_sends_campaign_check
  check (campaign in ('moose_intro', 'welcome', 'forward_share', 'new_event', 'event_reminder'));
