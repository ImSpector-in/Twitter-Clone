-- Fix 1: Notification INSERT policy was too permissive — any authenticated user
-- could INSERT a notification with any actor_id (spoofed "X liked your tweet").
-- New policy restricts inserts so actor_id must match the caller's uid.
-- System notifications (likes/follows/replies) are already handled by SECURITY DEFINER
-- triggers which run as superuser and bypass RLS entirely, so they are unaffected.
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;

CREATE POLICY "Authenticated can create notifications"
  ON public.notifications
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- Fix 2: is_admin escalation defense-in-depth.
-- The column-level UPDATE grant already excludes is_admin (migration 20260515000000),
-- but this RESTRICTIVE policy adds a second layer: even if a future grant accidentally
-- re-includes is_admin, users still cannot change their own or others' flag.
CREATE POLICY "Guard is_admin from escalation"
  ON public.profiles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  WITH CHECK (
    is_admin IS NOT DISTINCT FROM (
      SELECT is_admin FROM public.profiles WHERE id = auth.uid()
    )
  );
