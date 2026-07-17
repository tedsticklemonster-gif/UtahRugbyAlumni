-- Migration 021 rebuilt the campaign check without 'thank_you' (added in 019),
-- so pledge thank-you sends have been failing the constraint. Restore it and
-- add the digest/pledge-reminder campaigns.
alter table email_sends drop constraint if exists email_sends_campaign_check;
alter table email_sends add constraint email_sends_campaign_check
  check (campaign in (
    'moose_intro', 'welcome', 'forward_share', 'new_event', 'event_reminder',
    'thank_you', 'weekly_digest', 'pledge_reminder'
  ));
