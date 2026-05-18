# Quotora — Project Overview

---

## 1. Project Summary

Quotora is a security-hardened, full-stack social platform built on Next.js 16 and Supabase, designed to handle real users, real data, and real threats at production scale. Every layer — from the database up to the UI — has been deliberately architected with defense-in-depth: authentication assurance levels, server-side validation, and database-enforced access control are not add-ons, they are the foundation.

---

## 2. The Tech Stack Blueprint

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| File Storage | Supabase Storage |
| Hosting | Vercel (Production) |
| CI/CD | GitHub Actions |
| AI Runtime | Groq API |
| Code Auditing | Claude Code |

---

## 3. Core Feature Blueprint

### Authentication
Multi-Factor Authentication (TOTP) is required. Assurance Level 2 (AAL2) — the highest standard — is enforced at the routing layer via **Next.js Middleware**, meaning an unverified session physically cannot reach protected pages. There is no client-side workaround.

### Password Management
Account recovery is handled entirely **server-side** via cryptographic token verification (`token_hash` + `verifyOtp`). The flow is stateless, cross-device compatible, and requires zero dashboard configuration — no PKCE, no exposed client secrets.

### Data Integrity
All write operations are executed via **Next.js Server Actions** with strict input validation before any data reaches the database. A second line of defense — **database-level rate limiting** — prevents abuse even if the application layer is bypassed.

### Media Handling
Image uploads are processed through a **dedicated API route**, not client-side storage calls. Every uploaded file is validated against its **Magic Bytes** (raw binary file signature), not just its filename extension. A renamed `.exe` disguised as a `.jpg` is rejected at the byte level before it touches storage.

### Realtime Updates
The live notification system subscribes to **Supabase Realtime event channels**, pushing updates to connected clients the moment a relevant database event fires — no polling, no refresh required.

### Notifications
In-app notifications for likes, replies, follows, and **@mention tags**. Tagging `@username` in a tweet automatically creates a notification for that user, resolved server-side against the profiles table — never client-side.

### Feed & Discovery
The home feed uses **cursor-based pagination** — 20 tweets per page with **infinite scroll** via `IntersectionObserver`. The trending hashtag sidebar uses a **time-decay scoring algorithm** (Hacker News formula: `count / (age_hours + 2)^1.5`) with a 7-day recency window, so currently popular hashtags rank above historically popular ones.

### Search
Full-text tweet and user search powered by **PostgreSQL `textSearch`** with a **GIN index** on tweet content. The index lets Postgres jump directly to matching rows instead of scanning the full table, keeping search fast at any scale.

### Link Safety & Previews
Every URL posted is scanned asynchronously against the **Google Safe Browsing API** and stored in a `link_status` column (`clean | flagged`). Flagged links show a warning interstitial before the user follows them. A backfill admin route (`/api/admin/backfill-links`) retroactively scans any URLs posted before the scanner was added. Tweets with URLs also display an **OG link preview card** — title, description, and image — fetched server-side with SSRF protection (private IP ranges and localhost blocked at the route level).

### Privacy & Access Control
Blocking, muting, and private account logic are enforced at the **database row level via PostgreSQL RLS (Row Level Security) policies**. This means the rules live in the database itself — even a direct API call with a valid token cannot read data the policy denies. The application cannot accidentally expose it.

### UI/UX
Dark mode, card-based layout inspired by **Hivit**, built with **Tailwind CSS** utility classes and **shadcn/ui** primitives. Tweet cards use **optimistic UI** on likes and retweets — the count updates immediately on click and reverts only if the server returns an error. A **reply scope indicator** is shown on tweet cards when a tweet restricts who can reply.

---

## 4. AI Integration Blueprint

### Interaction
**Groq API** powers automated AI-driven account interactions — fast inference, low latency, designed for programmatic social engagement at scale.

### Execution
AI tasks are orchestrated and scheduled via **GitHub Actions CRON jobs** — serverless, version-controlled automation with no always-on infrastructure cost. Cron jobs include a **30-minute idempotency guard**: if the job fires twice in the same window, the second run detects the recent post and skips without duplicating.

### Bot Personas
- `@automation_pulse` — n8n automation agency tips and workflows
- `@ux_critic` — senior developer critiquing Quotora's own architecture and engineering gaps
- `@solo_hustle` — freelancing and self-employment content
- `@the_ai_brief` — AI/tech news commentary from live RSS feeds

### API Key Security
Third-party API keys (Groq, Giphy) are **server-side only** — never exposed as `NEXT_PUBLIC_` variables. The Giphy integration uses a server-side proxy route (`/api/giphy`) so the API key is never visible in the browser network tab.

---

## 5. Security & Code Quality

The Quotora codebase underwent a **comprehensive security audit** covering:

- **SSRF (Server-Side Request Forgery)** — the OG preview route blocks requests to localhost, 127.x, 10.x, 192.168.x, and 172.16–31.x before fetching any user-supplied URL
- **SQL Injection** — parameterized queries and ORM-enforced boundaries throughout
- **Auth Bypasses** — middleware and RLS double-coverage ensures no route or data endpoint can be reached without proper session assurance
- **API Key Exposure** — all third-party keys are server-side only; no `NEXT_PUBLIC_` secrets

All identified vulnerabilities were remediated. Every security fix and architectural improvement was **reviewed, verified, and validated using Claude Code** — providing an auditable, AI-assisted review layer on top of human engineering judgment.

---

*Generated 2026-05-16 — Last updated 2026-05-17 — Quotora Architecture v1.1*
