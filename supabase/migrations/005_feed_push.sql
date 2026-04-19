-- 005_feed_push.sql
-- Activity feed (announcements + posts) and push notification subscriptions.

-- ── Announcements (admin-created broadcast messages) ──────────────────────
create table announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  created_at  timestamptz not null default now(),
  created_by  uuid references alumni(id) on delete set null
);

alter table announcements enable row level security;

create policy "Verified alumni read announcements"
  on announcements for select to authenticated
  using (true);

create policy "Admin manage announcements"
  on announcements for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ── Posts (alumni wall posts) ─────────────────────────────────────────────
create table posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references alumni(id) on delete cascade,
  body        text not null check (char_length(body) <= 2000),
  photo_url   text,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz  -- soft-delete by admin
);

create index idx_posts_created_at on posts (created_at desc);

alter table posts enable row level security;

create policy "Verified alumni read posts"
  on posts for select to authenticated
  using (deleted_at is null);

create policy "Alumni insert own post"
  on posts for insert to authenticated
  with check (
    author_id = (
      select id from alumni where email = auth.jwt() ->> 'email' limit 1
    )
  );

create policy "Admin manage posts"
  on posts for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ── Push notification subscriptions ──────────────────────────────────────
create table push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  alumni_id   uuid references alumni(id) on delete cascade,
  endpoint    text unique not null,
  p256dh      text not null,
  auth_key    text not null,  -- 'auth' is a reserved word in Postgres
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index idx_push_subs_alumni on push_subscriptions (alumni_id);

alter table push_subscriptions enable row level security;

-- Alumni can manage their own subscriptions
create policy "Alumni manage own push subs"
  on push_subscriptions for all to authenticated
  using (
    alumni_id = (
      select id from alumni where email = auth.jwt() ->> 'email' limit 1
    )
  )
  with check (
    alumni_id = (
      select id from alumni where email = auth.jwt() ->> 'email' limit 1
    )
  );

create policy "Admin read push subs"
  on push_subscriptions for select to authenticated
  using (is_admin());
