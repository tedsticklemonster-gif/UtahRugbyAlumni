-- Add post enhancements: edit tracking, pinning, categories
alter table posts add column if not exists updated_at timestamptz;
alter table posts add column if not exists pinned boolean not null default false;
alter table posts add column if not exists category text;

create index if not exists idx_posts_pinned on posts (pinned) where pinned = true;
