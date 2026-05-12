ALTER TABLE tweets
  ADD COLUMN IF NOT EXISTS link_status text
  CHECK (link_status IN ('pending', 'clean', 'flagged'));
