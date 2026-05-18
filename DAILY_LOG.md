# Quotora — Daily Build Log

A running log of what was built each day. One entry per day, updated as work continues.

---

## May 5
Initial project setup — Next.js, TypeScript, Tailwind, shadcn/ui, and Supabase all wired together and deployed to Vercel.

## May 6
Core app built out: auth (signup/login/logout), tweet composer, home feed, profile pages, follow/unfollow system, likes, and an explore page with sidebar nav.

## May 7
Heavy feature day — added comments/reply threads, notifications, AI bots that auto-reply to users, two-factor authentication (2FA), avatar uploads, bookmarks, retweets, tweet search, block/mute, forgot/reset password, mobile nav, loading skeletons, a full settings system (dark mode, privacy, data export), and the teal/cyan color theme.

## May 8
Branding and full visual overhaul — app renamed to **Quotora** with a new logo, dark navy/aurora UI redesign, new auth page design, trending sidebar, mobile slide-in drawer menu, and a Next.js security patch.

## May 10
Security hardening sprint — a full white-box pentest was run and all 29 findings (Q-001 through Q-029) were fixed, covering auth bypasses, block bypass, input validation, file upload safety, timing-safe secrets, and security headers.

## May 11
Database cleanup — baseline schema committed to the repo, Row Level Security (RLS) policies finalized, and migration filenames standardized with proper timestamps.

## May 12
Admin badge added to tweets and profile pages; repost UI with a three-dot menu built out; malicious link scanning via Google Safe Browsing added; bots upgraded with images, hashtags, and an AI news persona; several bug fixes for quote tweets, thread pages, and the repost flow.

## May 14
Direct messaging launched with real-time updates and read receipts; @mentions now highlight as clickable orange links; trending hashtags card added to the right sidebar; password reset flow fixed after multiple failed attempts; trending page redesigned with a card-based layout.

## May 15
Emoji picker, GIF picker (Giphy), and a who-can-reply toggle added to the tweet composer; mobile polish pass (back buttons, logo tap opens drawer, keyboard-aware post dialog, floating button hidden on messages pages); Radix Popover replaced with a custom dropdown after it was found to silently break; scroll and layout bugs fixed on mobile.

## May 16
Pre-ship polish and bug fix day. Fixed the Quotora logo being invisible on desktop (two copies of the SVG were rendering duplicate gradient IDs, causing one to cancel the other out). Then ran a full quality and security review pass: extracted a shared `useClickOutside` hook to replace copy-pasted code across three dropdowns; pulled all nav items into a single config file shared by the sidebar, mobile drawer, and bottom nav; fixed the profile tab incorrectly highlighting when viewing someone else's profile; added `aria-label` to every icon-only button for accessibility; fixed the GIF picker firing two API requests on open; added an error state to the GIF picker; fixed a double-click race condition on logout; and added a missing database migration for the reply-scope setting, which had been silently failing to save since the column didn't exist.

## May 17
Engineering improvements and hardening across the whole stack. Rewrote the UX critic bot with a senior developer persona — critiques now target real architectural gaps (pagination limits, subscription cleanup, time-decay algorithms) rather than just missing UI features. Fixed a batch of legitimate engineering issues: Giphy API key moved fully server-side via a proxy route so it is never visible in the browser network tab; @mention notifications added so tagging @username in a tweet creates an in-app notification for that user; cursor-based pagination replaced the hard 50-tweet feed cap with infinite scroll loading 20 tweets at a time; reply scope indicator added to tweet cards showing a subtle icon when a tweet limits who can reply; link preview cards added — tweets containing URLs now show an OG metadata preview fetched through a server-side proxy with SSRF protection; trending hashtag algorithm switched from raw count to time-decay scoring (Hacker News formula: count / (age_hours + 2)^1.5) with a 7-day window so recent hashtags rank above historically popular ones; GIN index added to the tweets table and search switched from ILIKE to textSearch for faster full-text results; bot cron jobs hardened with a 30-minute dedup guard so a double-fired cron never creates duplicate posts; and a backfill admin route added at /api/admin/backfill-links to retroactively scan URLs from tweets posted before the malicious link scanner was built.

## May 18
Production follow-up and documentation cleanup. Fixed the `/home` production crash caused by Next.js rejecting `cookies()` inside an `unstable_cache` function: trending hashtags now use a cookie-free public Supabase client inside the cache boundary instead of the authenticated server client or the service-role admin client. Reworked link preview images so OG images load through an authenticated `/api/og-image` proxy with SSRF checks, redirect validation, MIME allow-listing, and a 5 MB cap; this keeps the Content Security Policy tight while allowing preview cards to show images from third-party CDNs. Investigated paid AI image moderation for uploads, confirmed it would require usable OpenAI API quota, and intentionally left it undeployed. Refreshed the README so the public-facing project summary now matches Quotora's current feature set without becoming a full architecture document.
