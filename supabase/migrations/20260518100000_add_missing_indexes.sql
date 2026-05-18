-- Add indexes on columns that are queried frequently but lack dedicated indexes.
-- The composite PKs (blocker_id, blocked_id) and (muter_id, muted_id) only
-- accelerate queries on the FIRST column; these cover the reverse lookups.

-- blocks: used in getExcludedUserIds to find "who has blocked me"
CREATE INDEX IF NOT EXISTS blocks_blocked_id_idx ON public.blocks USING btree (blocked_id);

-- mutes: used in getExcludedUserIds to find "who muted this user" (rare, but present)
CREATE INDEX IF NOT EXISTS mutes_muted_id_idx ON public.mutes USING btree (muted_id);

-- muted_words: queried on every feed load per user
CREATE INDEX IF NOT EXISTS muted_words_user_id_idx ON public.muted_words USING btree (user_id);

-- notifications: actor_id used in the new INSERT policy check
CREATE INDEX IF NOT EXISTS notifications_actor_id_idx ON public.notifications USING btree (actor_id);
