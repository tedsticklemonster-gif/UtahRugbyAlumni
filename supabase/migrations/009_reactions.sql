-- 009_reactions.sql
-- Post reactions (6-emoji set) and @mention tracking.
-- post_likes is kept intact for backward compat; drop in Phase 3.

create table if not exists post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  alumni_id  uuid not null references alumni(id) on delete cascade,
  emoji      text not null check (emoji in ('like','fire','clap','muscle','laugh','heart')),
  created_at timestamptz not null default now(),
  unique (post_id, alumni_id)
);

create table if not exists post_mentions (
  post_id    uuid not null references posts(id) on delete cascade,
  alumni_id  uuid not null references alumni(id) on delete cascade,
  comment_id uuid references post_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, alumni_id)
);

alter table post_reactions enable row level security;
alter table post_mentions enable row level security;

create policy "Verified alumni read reactions"
  on post_reactions for select to authenticated
  using (true);

create policy "Alumni manage own reaction"
  on post_reactions for all to authenticated
  using (alumni_id = (select id from alumni where email = auth.jwt()->>'email'))
  with check (alumni_id = (select id from alumni where email = auth.jwt()->>'email'));

create policy "Verified alumni read mentions"
  on post_mentions for select to authenticated
  using (true);

create policy "Alumni write mentions"
  on post_mentions for insert to authenticated
  with check (
    exists (select 1 from alumni where id = alumni_id and verified = true)
  );

-- Handy view: per-post emoji counts
create or replace view post_reaction_summary as
  select
    post_id,
    emoji,
    count(*) as reaction_count
  from post_reactions
  group by post_id, emoji;

create index if not exists post_reactions_post_id_idx on post_reactions(post_id);
