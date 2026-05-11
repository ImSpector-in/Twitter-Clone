
  create table "public"."blocks" (
    "blocker_id" uuid not null,
    "blocked_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."blocks" enable row level security;


  create table "public"."bookmarks" (
    "user_id" uuid not null,
    "tweet_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."bookmarks" enable row level security;


  create table "public"."follows" (
    "follower_id" uuid not null,
    "following_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."follows" enable row level security;


  create table "public"."likes" (
    "user_id" uuid not null,
    "tweet_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."likes" enable row level security;


  create table "public"."muted_words" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "word" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."muted_words" enable row level security;


  create table "public"."mutes" (
    "muter_id" uuid not null,
    "muted_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."mutes" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "actor_id" uuid not null,
    "type" text not null,
    "tweet_id" uuid,
    "read" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" text not null,
    "display_name" text,
    "bio" text,
    "avatar_url" text,
    "created_at" timestamp with time zone default now(),
    "is_private" boolean default false,
    "notify_likes" boolean default true,
    "notify_replies" boolean default true,
    "notify_follows" boolean default true
      );


alter table "public"."profiles" enable row level security;


  create table "public"."tweets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone default now(),
    "reply_to_id" uuid,
    "image_url" text,
    "reply_scope" text default 'everyone'::text,
    "retweet_of_id" uuid,
    "quote_content" text
      );


alter table "public"."tweets" enable row level security;

CREATE UNIQUE INDEX blocks_pkey ON public.blocks USING btree (blocker_id, blocked_id);

CREATE UNIQUE INDEX bookmarks_pkey ON public.bookmarks USING btree (user_id, tweet_id);

CREATE INDEX follows_follower_id_idx ON public.follows USING btree (follower_id);

CREATE INDEX follows_following_id_idx ON public.follows USING btree (following_id);

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (follower_id, following_id);

CREATE UNIQUE INDEX likes_pkey ON public.likes USING btree (user_id, tweet_id);

CREATE INDEX likes_tweet_id_idx ON public.likes USING btree (tweet_id);

CREATE UNIQUE INDEX muted_words_pkey ON public.muted_words USING btree (id);

CREATE UNIQUE INDEX mutes_pkey ON public.mutes USING btree (muter_id, muted_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE INDEX notifications_user_id_read_idx ON public.notifications USING btree (user_id, read);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE INDEX tweets_created_at_idx ON public.tweets USING btree (created_at DESC);

CREATE UNIQUE INDEX tweets_pkey ON public.tweets USING btree (id);

CREATE INDEX tweets_reply_to_id_idx ON public.tweets USING btree (reply_to_id);

CREATE INDEX tweets_retweet_of_id_idx ON public.tweets USING btree (retweet_of_id);

CREATE INDEX tweets_user_id_idx ON public.tweets USING btree (user_id);

alter table "public"."blocks" add constraint "blocks_pkey" PRIMARY KEY using index "blocks_pkey";

alter table "public"."bookmarks" add constraint "bookmarks_pkey" PRIMARY KEY using index "bookmarks_pkey";

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."likes" add constraint "likes_pkey" PRIMARY KEY using index "likes_pkey";

alter table "public"."muted_words" add constraint "muted_words_pkey" PRIMARY KEY using index "muted_words_pkey";

alter table "public"."mutes" add constraint "mutes_pkey" PRIMARY KEY using index "mutes_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."tweets" add constraint "tweets_pkey" PRIMARY KEY using index "tweets_pkey";

alter table "public"."blocks" add constraint "blocks_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."blocks" validate constraint "blocks_blocked_id_fkey";

alter table "public"."blocks" add constraint "blocks_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."blocks" validate constraint "blocks_blocker_id_fkey";

alter table "public"."blocks" add constraint "blocks_check" CHECK ((blocker_id <> blocked_id)) not valid;

alter table "public"."blocks" validate constraint "blocks_check";

alter table "public"."bookmarks" add constraint "bookmarks_tweet_id_fkey" FOREIGN KEY (tweet_id) REFERENCES public.tweets(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_tweet_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_user_id_fkey";

alter table "public"."follows" add constraint "follows_check" CHECK ((follower_id <> following_id)) not valid;

alter table "public"."follows" validate constraint "follows_check";

alter table "public"."follows" add constraint "follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_id_fkey";

alter table "public"."follows" add constraint "follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_following_id_fkey";

alter table "public"."likes" add constraint "likes_tweet_id_fkey" FOREIGN KEY (tweet_id) REFERENCES public.tweets(id) ON DELETE CASCADE not valid;

alter table "public"."likes" validate constraint "likes_tweet_id_fkey";

alter table "public"."likes" add constraint "likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."likes" validate constraint "likes_user_id_fkey";

alter table "public"."muted_words" add constraint "muted_words_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."muted_words" validate constraint "muted_words_user_id_fkey";

alter table "public"."mutes" add constraint "mutes_check" CHECK ((muter_id <> muted_id)) not valid;

alter table "public"."mutes" validate constraint "mutes_check";

alter table "public"."mutes" add constraint "mutes_muted_id_fkey" FOREIGN KEY (muted_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mutes" validate constraint "mutes_muted_id_fkey";

alter table "public"."mutes" add constraint "mutes_muter_id_fkey" FOREIGN KEY (muter_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mutes" validate constraint "mutes_muter_id_fkey";

alter table "public"."notifications" add constraint "notifications_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_actor_id_fkey";

alter table "public"."notifications" add constraint "notifications_tweet_id_fkey" FOREIGN KEY (tweet_id) REFERENCES public.tweets(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_tweet_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK ((type = ANY (ARRAY['like'::text, 'follow'::text, 'reply'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."tweets" add constraint "tweets_content_check" CHECK (((char_length(content) >= 1) AND (char_length(content) <= 280))) not valid;

alter table "public"."tweets" validate constraint "tweets_content_check";

alter table "public"."tweets" add constraint "tweets_reply_scope_check" CHECK ((reply_scope = ANY (ARRAY['everyone'::text, 'followers'::text, 'nobody'::text]))) not valid;

alter table "public"."tweets" validate constraint "tweets_reply_scope_check";

alter table "public"."tweets" add constraint "tweets_reply_to_id_fkey" FOREIGN KEY (reply_to_id) REFERENCES public.tweets(id) ON DELETE CASCADE not valid;

alter table "public"."tweets" validate constraint "tweets_reply_to_id_fkey";

alter table "public"."tweets" add constraint "tweets_retweet_of_id_fkey" FOREIGN KEY (retweet_of_id) REFERENCES public.tweets(id) ON DELETE CASCADE not valid;

alter table "public"."tweets" validate constraint "tweets_retweet_of_id_fkey";

alter table "public"."tweets" add constraint "tweets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."tweets" validate constraint "tweets_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_follow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_like()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  tweet_owner uuid;
begin
  select user_id into tweet_owner from public.tweets where id = new.tweet_id;
  if tweet_owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, tweet_id)
    values (tweet_owner, new.user_id, 'like', new.tweet_id);
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_reply()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  tweet_owner uuid;
begin
  if new.reply_to_id is not null then
    select user_id into tweet_owner from public.tweets where id = new.reply_to_id;
    if tweet_owner <> new.user_id then
      insert into public.notifications (user_id, actor_id, type, tweet_id)
      values (tweet_owner, new.user_id, 'reply', new.reply_to_id);
    end if;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    'user_' || substring(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."blocks" to "anon";

grant insert on table "public"."blocks" to "anon";

grant references on table "public"."blocks" to "anon";

grant select on table "public"."blocks" to "anon";

grant trigger on table "public"."blocks" to "anon";

grant truncate on table "public"."blocks" to "anon";

grant update on table "public"."blocks" to "anon";

grant delete on table "public"."blocks" to "authenticated";

grant insert on table "public"."blocks" to "authenticated";

grant references on table "public"."blocks" to "authenticated";

grant select on table "public"."blocks" to "authenticated";

grant trigger on table "public"."blocks" to "authenticated";

grant truncate on table "public"."blocks" to "authenticated";

grant update on table "public"."blocks" to "authenticated";

grant delete on table "public"."blocks" to "service_role";

grant insert on table "public"."blocks" to "service_role";

grant references on table "public"."blocks" to "service_role";

grant select on table "public"."blocks" to "service_role";

grant trigger on table "public"."blocks" to "service_role";

grant truncate on table "public"."blocks" to "service_role";

grant update on table "public"."blocks" to "service_role";

grant delete on table "public"."bookmarks" to "anon";

grant insert on table "public"."bookmarks" to "anon";

grant references on table "public"."bookmarks" to "anon";

grant select on table "public"."bookmarks" to "anon";

grant trigger on table "public"."bookmarks" to "anon";

grant truncate on table "public"."bookmarks" to "anon";

grant update on table "public"."bookmarks" to "anon";

grant delete on table "public"."bookmarks" to "authenticated";

grant insert on table "public"."bookmarks" to "authenticated";

grant references on table "public"."bookmarks" to "authenticated";

grant select on table "public"."bookmarks" to "authenticated";

grant trigger on table "public"."bookmarks" to "authenticated";

grant truncate on table "public"."bookmarks" to "authenticated";

grant update on table "public"."bookmarks" to "authenticated";

grant delete on table "public"."bookmarks" to "service_role";

grant insert on table "public"."bookmarks" to "service_role";

grant references on table "public"."bookmarks" to "service_role";

grant select on table "public"."bookmarks" to "service_role";

grant trigger on table "public"."bookmarks" to "service_role";

grant truncate on table "public"."bookmarks" to "service_role";

grant update on table "public"."bookmarks" to "service_role";

grant delete on table "public"."follows" to "anon";

grant insert on table "public"."follows" to "anon";

grant references on table "public"."follows" to "anon";

grant select on table "public"."follows" to "anon";

grant trigger on table "public"."follows" to "anon";

grant truncate on table "public"."follows" to "anon";

grant update on table "public"."follows" to "anon";

grant delete on table "public"."follows" to "authenticated";

grant insert on table "public"."follows" to "authenticated";

grant references on table "public"."follows" to "authenticated";

grant select on table "public"."follows" to "authenticated";

grant trigger on table "public"."follows" to "authenticated";

grant truncate on table "public"."follows" to "authenticated";

grant update on table "public"."follows" to "authenticated";

grant delete on table "public"."follows" to "service_role";

grant insert on table "public"."follows" to "service_role";

grant references on table "public"."follows" to "service_role";

grant select on table "public"."follows" to "service_role";

grant trigger on table "public"."follows" to "service_role";

grant truncate on table "public"."follows" to "service_role";

grant update on table "public"."follows" to "service_role";

grant delete on table "public"."likes" to "anon";

grant insert on table "public"."likes" to "anon";

grant references on table "public"."likes" to "anon";

grant select on table "public"."likes" to "anon";

grant trigger on table "public"."likes" to "anon";

grant truncate on table "public"."likes" to "anon";

grant update on table "public"."likes" to "anon";

grant delete on table "public"."likes" to "authenticated";

grant insert on table "public"."likes" to "authenticated";

grant references on table "public"."likes" to "authenticated";

grant select on table "public"."likes" to "authenticated";

grant trigger on table "public"."likes" to "authenticated";

grant truncate on table "public"."likes" to "authenticated";

grant update on table "public"."likes" to "authenticated";

grant delete on table "public"."likes" to "service_role";

grant insert on table "public"."likes" to "service_role";

grant references on table "public"."likes" to "service_role";

grant select on table "public"."likes" to "service_role";

grant trigger on table "public"."likes" to "service_role";

grant truncate on table "public"."likes" to "service_role";

grant update on table "public"."likes" to "service_role";

grant delete on table "public"."muted_words" to "anon";

grant insert on table "public"."muted_words" to "anon";

grant references on table "public"."muted_words" to "anon";

grant select on table "public"."muted_words" to "anon";

grant trigger on table "public"."muted_words" to "anon";

grant truncate on table "public"."muted_words" to "anon";

grant update on table "public"."muted_words" to "anon";

grant delete on table "public"."muted_words" to "authenticated";

grant insert on table "public"."muted_words" to "authenticated";

grant references on table "public"."muted_words" to "authenticated";

grant select on table "public"."muted_words" to "authenticated";

grant trigger on table "public"."muted_words" to "authenticated";

grant truncate on table "public"."muted_words" to "authenticated";

grant update on table "public"."muted_words" to "authenticated";

grant delete on table "public"."muted_words" to "service_role";

grant insert on table "public"."muted_words" to "service_role";

grant references on table "public"."muted_words" to "service_role";

grant select on table "public"."muted_words" to "service_role";

grant trigger on table "public"."muted_words" to "service_role";

grant truncate on table "public"."muted_words" to "service_role";

grant update on table "public"."muted_words" to "service_role";

grant delete on table "public"."mutes" to "anon";

grant insert on table "public"."mutes" to "anon";

grant references on table "public"."mutes" to "anon";

grant select on table "public"."mutes" to "anon";

grant trigger on table "public"."mutes" to "anon";

grant truncate on table "public"."mutes" to "anon";

grant update on table "public"."mutes" to "anon";

grant delete on table "public"."mutes" to "authenticated";

grant insert on table "public"."mutes" to "authenticated";

grant references on table "public"."mutes" to "authenticated";

grant select on table "public"."mutes" to "authenticated";

grant trigger on table "public"."mutes" to "authenticated";

grant truncate on table "public"."mutes" to "authenticated";

grant update on table "public"."mutes" to "authenticated";

grant delete on table "public"."mutes" to "service_role";

grant insert on table "public"."mutes" to "service_role";

grant references on table "public"."mutes" to "service_role";

grant select on table "public"."mutes" to "service_role";

grant trigger on table "public"."mutes" to "service_role";

grant truncate on table "public"."mutes" to "service_role";

grant update on table "public"."mutes" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."tweets" to "anon";

grant insert on table "public"."tweets" to "anon";

grant references on table "public"."tweets" to "anon";

grant select on table "public"."tweets" to "anon";

grant trigger on table "public"."tweets" to "anon";

grant truncate on table "public"."tweets" to "anon";

grant update on table "public"."tweets" to "anon";

grant delete on table "public"."tweets" to "authenticated";

grant insert on table "public"."tweets" to "authenticated";

grant references on table "public"."tweets" to "authenticated";

grant select on table "public"."tweets" to "authenticated";

grant trigger on table "public"."tweets" to "authenticated";

grant truncate on table "public"."tweets" to "authenticated";

grant update on table "public"."tweets" to "authenticated";

grant delete on table "public"."tweets" to "service_role";

grant insert on table "public"."tweets" to "service_role";

grant references on table "public"."tweets" to "service_role";

grant select on table "public"."tweets" to "service_role";

grant trigger on table "public"."tweets" to "service_role";

grant truncate on table "public"."tweets" to "service_role";

grant update on table "public"."tweets" to "service_role";


  create policy "Users manage own blocks"
  on "public"."blocks"
  as permissive
  for all
  to public
using ((auth.uid() = blocker_id))
with check ((auth.uid() = blocker_id));



  create policy "Users manage own bookmarks"
  on "public"."bookmarks"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Follows are public"
  on "public"."follows"
  as permissive
  for select
  to public
using (true);



  create policy "Users can follow others"
  on "public"."follows"
  as permissive
  for insert
  to public
with check ((auth.uid() = follower_id));



  create policy "Users can unfollow"
  on "public"."follows"
  as permissive
  for delete
  to public
using ((auth.uid() = follower_id));



  create policy "Likes are public"
  on "public"."likes"
  as permissive
  for select
  to public
using (true);



  create policy "Users can like"
  on "public"."likes"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can unlike"
  on "public"."likes"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users manage own muted words"
  on "public"."muted_words"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own mutes"
  on "public"."mutes"
  as permissive
  for all
  to public
using ((auth.uid() = muter_id))
with check ((auth.uid() = muter_id));



  create policy "Authenticated can create notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Users can mark own notifications read"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users see own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Profiles are public"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Tweets are public"
  on "public"."tweets"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete own tweets"
  on "public"."tweets"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own tweets"
  on "public"."tweets"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));


CREATE TRIGGER on_follow_created AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();

CREATE TRIGGER on_like_created AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

CREATE TRIGGER on_reply_created AFTER INSERT ON public.tweets FOR EACH ROW EXECUTE FUNCTION public.handle_new_reply();


