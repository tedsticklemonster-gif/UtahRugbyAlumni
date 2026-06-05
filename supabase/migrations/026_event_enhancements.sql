-- Add event enhancements: cost info
alter table events add column if not exists cost text;

-- Update kind check to include new types
alter table events drop constraint if exists events_kind_check;
alter table events add constraint events_kind_check
  check (kind in ('social', 'reunion', 'watch_party', 'practice', 'fundraiser', 'networking', 'game_day', 'other'));
