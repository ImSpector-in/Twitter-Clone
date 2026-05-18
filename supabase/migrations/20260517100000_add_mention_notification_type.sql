-- Add 'mention' to the notifications type check constraint
ALTER TABLE public.notifications
  DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
    CHECK (type = ANY (ARRAY['like'::text, 'follow'::text, 'reply'::text, 'mention'::text]));
