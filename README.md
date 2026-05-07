# Twitter Clone

A full-stack Twitter/X clone built as a portfolio project.

**Live:** https://twitter-clone-livid-phi.vercel.app

## Features

- **Auth** — Sign up, log in, log out (Supabase Auth)
- **Posts** — Write tweets up to 280 characters
- **Feed** — "For You" (all tweets) and "Following" tabs
- **Follow / Unfollow** — Follow other users, see their tweets in your feed
- **Likes** — Like and unlike tweets with live counts
- **Profiles** — View any user's profile, tweets, follower/following counts
- **Edit Profile** — Update username, display name, bio, and avatar photo
- **Search** — Find users by username or display name
- **Responsive** — Works on desktop and mobile

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / DB / Auth | Supabase (PostgreSQL) |
| Hosting | Vercel |

## Running Locally

1. Clone the repo
```bash
git clone https://github.com/ImSpector-in/Twitter-Clone.git
cd Twitter-Clone
npm install
```

2. Create a Supabase project at [supabase.com](https://supabase.com)

3. Add environment variables to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the dev server:
```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).
