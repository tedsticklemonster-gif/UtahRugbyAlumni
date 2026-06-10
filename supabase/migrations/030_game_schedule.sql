-- Admin-managed game schedule
-- Replaces brittle web scraping from utah-rugby.com

CREATE TABLE game_schedule (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opponent   text NOT NULL,
  game_date  timestamptz NOT NULL,
  location   text NOT NULL DEFAULT 'Away'
             CHECK (location IN ('Home', 'Away', 'Neutral')),
  result     text CHECK (result IS NULL OR result IN ('Win', 'Loss')),
  score      text,
  man_of_match text,
  notes      text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Only admins can manage the game schedule
ALTER TABLE game_schedule ENABLE ROW LEVEL SECURITY;

-- Everyone can read (public homepage needs this)
CREATE POLICY "game_schedule_read"
  ON game_schedule FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "game_schedule_admin_insert"
  ON game_schedule FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "game_schedule_admin_update"
  ON game_schedule FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "game_schedule_admin_delete"
  ON game_schedule FOR DELETE
  USING (is_admin());
