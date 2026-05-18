-- Security fix: the previous version accepted p_user_id as a parameter,
-- allowing any authenticated user to enumerate another user's unread DM count.
-- Replace with a parameterless function that uses auth.uid() internally.
DROP FUNCTION IF EXISTS public.get_unread_dm_count(uuid);

CREATE OR REPLACE FUNCTION public.get_unread_dm_count()
  RETURNS int
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
AS $$
  SELECT COUNT(*)::int
  FROM conversation_participants cp
  JOIN conversations c ON c.id = cp.conversation_id
  WHERE cp.user_id = auth.uid()
    AND c.last_message_at IS NOT NULL
    AND (cp.last_read_at IS NULL OR c.last_message_at > cp.last_read_at);
$$;
