-- Follow requests table for private account approval flow
CREATE TABLE public.follow_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send follow requests"
  ON public.follow_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can view their own requests (sent and received)"
  ON public.follow_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can cancel or owner can deny follow requests"
  ON public.follow_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

GRANT SELECT, INSERT, DELETE ON public.follow_requests TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.follow_requests TO service_role;

CREATE INDEX follow_requests_following_id_idx ON public.follow_requests (following_id);
CREATE INDEX follow_requests_follower_id_idx ON public.follow_requests (follower_id);

-- Allow the private account owner to insert a follows row when approving a request
CREATE POLICY "Private account owner can approve follow requests"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = following_id
    AND EXISTS (
      SELECT 1 FROM public.follow_requests fr
      WHERE fr.follower_id = follows.follower_id
        AND fr.following_id = follows.following_id
    )
  );

-- Replace open tweets RLS with privacy-aware policy
DROP POLICY "Tweets are public" ON public.tweets;

CREATE POLICY "Tweets visible to viewer"
  ON public.tweets FOR SELECT
  TO public
  USING (
    -- own tweets always visible
    auth.uid() = user_id
    OR
    -- public profile
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = tweets.user_id AND p.is_private = false
    )
    OR
    -- private profile that the viewer follows (approved follows only)
    EXISTS (
      SELECT 1 FROM public.follows f
      WHERE f.follower_id = auth.uid()
        AND f.following_id = tweets.user_id
    )
  );

-- Add follow_request and follow_request_accepted notification types
ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
    CHECK (type = ANY (ARRAY[
      'like'::text,
      'follow'::text,
      'reply'::text,
      'mention'::text,
      'follow_request'::text,
      'follow_request_accepted'::text
    ]));

-- Update handle_new_follow trigger: skip the follow notification for private accounts
-- (the app sends follow_request_accepted instead when a request is approved)
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  target_is_private boolean;
BEGIN
  SELECT is_private INTO target_is_private FROM public.profiles WHERE id = new.following_id;
  IF NOT COALESCE(target_is_private, false) THEN
    INSERT INTO public.notifications (user_id, actor_id, type)
    VALUES (new.following_id, new.follower_id, 'follow');
  END IF;
  RETURN new;
END;
$$;
