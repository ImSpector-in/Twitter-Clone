-- Add GIN index on tweet content for fast full-text search.
-- CONCURRENTLY: builds without locking the table (safe on live data).
-- IF NOT EXISTS: safe to re-run (idempotent).
CREATE INDEX CONCURRENTLY IF NOT EXISTS tweets_content_fts_idx
ON tweets USING GIN(to_tsvector('english', content));
