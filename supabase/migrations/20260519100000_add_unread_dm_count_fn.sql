-- Efficient SQL function for unread DM count — replaces the JS-side filter
-- that pulled all conversation_participants and compared timestamps in memory.
CREATE OR REPLACE FUNCTION public.get_unread_dm_count(p_user_id uuid)
  RETURNS int
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
AS $$
  SELECT COUNT(*)::int
  FROM conversation_participants cp
  JOIN conversations c ON c.id = cp.conversation_id
  WHERE cp.user_id = p_user_id
    AND c.last_message_at IS NOT NULL
    AND (cp.last_read_at IS NULL OR c.last_message_at > cp.last_read_at);
$$;
