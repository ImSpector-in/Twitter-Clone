-- Rate limit table for sensitive password-verification actions.
-- Prevents brute-forcing the current password through changePassword,
-- changeEmail, and deleteAccount server actions.
CREATE TABLE public.auth_attempts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action     text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_attempts_lookup_idx
  ON public.auth_attempts (user_id, action, created_at);

-- Only the service role (admin client) may insert/read — no user-facing RLS needed
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup: purge attempts older than 1 hour to keep the table small
CREATE OR REPLACE FUNCTION public.cleanup_auth_attempts()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.auth_attempts WHERE created_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cleanup_auth_attempts
  AFTER INSERT ON public.auth_attempts
  FOR EACH STATEMENT EXECUTE FUNCTION public.cleanup_auth_attempts();
