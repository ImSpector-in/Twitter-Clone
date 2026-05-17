-- Add default reply_scope preference to profiles.
-- The settings page lets users set a default for new tweets.
alter table public.profiles
  add column if not exists reply_scope text not null default 'everyone'
  check (reply_scope in ('everyone', 'followers', 'nobody'));
