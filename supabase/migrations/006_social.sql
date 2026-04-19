-- 006_social.sql
-- Post likes, post comments, and direct messages between alumni.
-- NOTE: Create a "post-photos" storage bucket in the Supabase dashboard before deploying.

-- ── Post likes ────────────────────────────────────────────────────────────────
create table post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  alumni_id  uuid not null references alumni(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, alumni_id)
);

create index idx_post_likes_post on post_likes (post_id);

alter table post_likes enable row level security;

create policy "Verified alumni read likes"
  on post_likes for select to authenticated using (true);

create policy "Alumni manage own likes"
  on post_likes for all to authenticated
  using (
    alumni_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  )
  with check (
    alumni_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  );

-- ── Post comments ─────────────────────────────────────────────────────────────
create table post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  author_id  uuid not null references alumni(id) on delete cascade,
  body       text not null check (char_length(body) <= 1000),
  photo_url  text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_post_comments_post on post_comments (post_id, created_at);

alter table post_comments enable row level security;

create policy "Verified alumni read comments"
  on post_comments for select to authenticated
  using (deleted_at is null);

create policy "Alumni insert own comment"
  on post_comments for insert to authenticated
  with check (
    author_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  );

create policy "Admin manage comments"
  on post_comments for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── Direct messages ───────────────────────────────────────────────────────────
create table messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references alumni(id) on delete cascade,
  recipient_id uuid not null references alumni(id) on delete cascade,
  body         text not null check (char_length(body) <= 2000),
  photo_url    text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_messages_recipient on messages (recipient_id, created_at desc);
create index idx_messages_sender    on messages (sender_id, created_at desc);

alter table messages enable row level security;

create policy "Participants read messages"
  on messages for select to authenticated
  using (
    sender_id    = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
    or
    recipient_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  );

create policy "Alumni send messages"
  on messages for insert to authenticated
  with check (
    sender_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  );

create policy "Recipient mark read"
  on messages for update to authenticated
  using (
    recipient_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  )
  with check (
    recipient_id = (select id from alumni where email = auth.jwt() ->> 'email' limit 1)
  );

create policy "Admin read all messages"
  on messages for select to authenticated
  using (is_admin());
