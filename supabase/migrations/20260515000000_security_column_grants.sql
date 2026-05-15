-- Security hardening: column-level UPDATE restrictions
-- Fixes Q-031, Q-032, Q-034 from PENTEST_REPORT_2.md

-- Q-031: Restrict tweet updates to content + edited_at for authenticated users.
-- All link_status writes now go through the admin client (service role) in server actions.
REVOKE UPDATE ON public.tweets FROM authenticated;
GRANT UPDATE (content, edited_at) ON public.tweets TO authenticated;

-- Q-032: Restrict message updates to deleted_at only.
-- The soft-delete RLS policy intent is preserved; content editing is now impossible.
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (deleted_at) ON public.messages TO authenticated;

-- Q-034: Remove is_admin from user-writable profile columns.
-- Revoke the table-level grant from the baseline migration and re-grant only the
-- columns that users legitimately update through server actions.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  username,
  display_name,
  bio,
  avatar_url,
  is_private,
  notify_likes,
  notify_replies,
  notify_follows,
  pinned_tweet_id
) ON public.profiles TO authenticated;

-- conversation_participants: users should only update last_read_at (read receipts).
-- The existing baseline grants table-level UPDATE; restrict to the one column.
REVOKE UPDATE ON public.conversation_participants FROM authenticated;
GRANT UPDATE (last_read_at) ON public.conversation_participants TO authenticated;
