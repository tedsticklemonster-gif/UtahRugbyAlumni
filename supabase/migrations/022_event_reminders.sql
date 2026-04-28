-- Track sent event reminders to prevent duplicates
create table if not exists event_reminders_sent (
  event_id   uuid not null references events(id) on delete cascade,
  alumni_id  uuid not null references alumni(id) on delete cascade,
  channel    text not null check (channel in ('push', 'email')),
  sent_at    timestamptz not null default now(),
  primary key (event_id, alumni_id, channel)
);

-- Expand notifications kind constraint to include event_reminder
alter table notifications drop constraint if exists notifications_kind_check;
alter table notifications add constraint notifications_kind_check
  check (kind in (
    'post_reaction','post_comment','post_mention',
    'message','event_invite','new_join','event_reminder'
  ));
