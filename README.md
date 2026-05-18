# Quotora

A full-stack Twitter/X-style social app built as a portfolio project.

**Live:** https://twitter-clone-livid-phi.vercel.app

## Features

- **Auth** - Sign up, log in, log out, email confirmation, password reset, Google OAuth, and 2FA.
- **Posts** - Create tweets with images, GIFs, hashtags, mentions, and reply-scope controls.
- **Feed** - "For You" and "Following" tabs with cursor-based pagination and infinite scroll.
- **Social actions** - Like, reply, retweet, quote tweet, bookmark, follow, block, and mute.
- **Profiles** - Public/private profiles, avatar uploads, pinned tweets, followers, and following pages.
- **Notifications** - Realtime notifications for likes, replies, follows, and @mentions.
- **Messages** - Direct messages with realtime updates and read receipts.
- **Search & discovery** - Search people and tweets, browse trending hashtags, and view link preview cards.
- **Safety** - Server-side upload validation, malicious link scanning, SSRF-protected previews, RLS policies, and security headers.
- **AI bots** - Scheduled bot accounts powered by Groq and GitHub Actions.
- **Responsive UI** - Works across desktop and mobile with dark mode support.

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / DB / Auth | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| AI | Groq API |
| Link Safety | Google Safe Browsing |
| Media | Giphy API |
| Automation | GitHub Actions |
| Hosting | Vercel |

## Running Locally

1. Clone the repo

```bash
git clone https://github.com/ImSpector-in/Twitter-Clone.git
cd Twitter-Clone
npm install
```

2. Create a Supabase project at [supabase.com](https://supabase.com).

3. Add environment variables to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
GIPHY_API_KEY=your-giphy-api-key
GOOGLE_SAFE_BROWSING_API_KEY=your-google-safe-browsing-key
CRON_SECRET=your-cron-secret
```

4. Start the dev server:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).
