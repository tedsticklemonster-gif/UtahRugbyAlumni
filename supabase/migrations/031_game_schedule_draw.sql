-- Rugby games can end in a draw
ALTER TABLE game_schedule DROP CONSTRAINT game_schedule_result_check;
ALTER TABLE game_schedule ADD CONSTRAINT game_schedule_result_check
  CHECK (result IS NULL OR result IN ('Win', 'Loss', 'Draw'));
