-- Fix retweet constraint: allow empty content when it's a retweet
ALTER TABLE "public"."tweets" DROP CONSTRAINT "tweets_content_check";
ALTER TABLE "public"."tweets" ADD CONSTRAINT "tweets_content_check"
  CHECK (
    retweet_of_id IS NOT NULL OR
    (char_length(content) >= 1 AND char_length(content) <= 280)
  );

-- Add pinned tweet to profiles
ALTER TABLE "public"."profiles" ADD COLUMN "pinned_tweet_id" uuid REFERENCES public.tweets(id) ON DELETE SET NULL;
