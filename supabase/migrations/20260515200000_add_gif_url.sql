ALTER TABLE public.tweets ADD COLUMN gif_url text;

ALTER TABLE public.tweets ADD CONSTRAINT tweets_gif_url_check
  CHECK (
    gif_url IS NULL
    OR gif_url LIKE 'https://media.tenor.com/%'
    OR gif_url LIKE 'https://c.tenor.com/%'
  );

GRANT UPDATE (gif_url) ON public.tweets TO authenticated;
