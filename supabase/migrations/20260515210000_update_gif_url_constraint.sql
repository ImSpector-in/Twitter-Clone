-- Switch GIF CDN constraint from Tenor to Giphy
ALTER TABLE public.tweets DROP CONSTRAINT IF EXISTS tweets_gif_url_check;

ALTER TABLE public.tweets ADD CONSTRAINT tweets_gif_url_check
  CHECK (gif_url IS NULL OR gif_url ~ '^https://media[0-9]*\.giphy\.com/');
