-- 029_notification_kinds.sql
-- Expand notification kinds for richer in-app notifications.
-- Add: new_event, rsvp, announcement, comment_reply

alter table notifications drop constraint if exists notifications_kind_check;
alter table notifications add constraint notifications_kind_check
  check (kind in (
    'post_reaction','post_comment','post_mention',
    'message','event_invite','new_join','event_reminder',
    'new_event','rsvp','announcement','comment_reply'
  ));

-- Add optional body_preview column for richer notification text
alter table notifications add column if not exists body_preview text;
