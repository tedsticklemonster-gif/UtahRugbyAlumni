-- 010_notifications.sql
-- In-app notification inbox. Push fan-out uses the existing /api/push route.

create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references alumni(id) on delete cascade,
  actor_id    uuid references alumni(id) on delete set null,
  kind        text not null check (kind in (
                'post_reaction','post_comment','post_mention',
                'message','event_invite','new_join'
              )),
  entity_type text,   -- 'post' | 'event' | 'message'
  entity_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notif_recipient_unread_idx
  on notifications (recipient_id, created_at desc)
  where read_at is null;

alter table notifications enable row level security;

create policy "Users read own notifications"
  on notifications for select to authenticated
  using (recipient_id = (select id from alumni where email = auth.jwt()->>'email'));

create policy "Users mark own read"
  on notifications for update to authenticated
  using (recipient_id = (select id from alumni where email = auth.jwt()->>'email'));

create policy "System insert notifications"
  on notifications for insert to authenticated
  with check (true);
