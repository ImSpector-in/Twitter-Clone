-- Fix: allow users to update last_read_at on their own conversation participation rows.
-- Without this policy, markConversationRead() silently updates 0 rows (RLS blocks it)
-- and the unread DM badge never clears.
create policy "members update own last_read_at"
  on public.conversation_participants for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());
