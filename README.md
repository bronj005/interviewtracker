# Interview Tracker

Calendar dashboard for tracking daily interview **Calls / Round 1 / Round 2 / Round 3** across
7–10 job-portal profiles (Naukri, LinkedIn, …). Tap a day → tap **+ / −**. Works on desktop and mobile.

## Database: hosted PostgreSQL (Neon)

The data lives in the cloud, so every PC and phone sees the same counts.
Neon's free tier is far more than this app needs.

### One-time setup

1. Sign up at <https://neon.tech> and create a project (pick the region closest to you, e.g. Singapore/Mumbai).
2. Click **Connect** and copy two connection strings into `.env` (see `.env.example`):
   - `DATABASE_URL`: the **pooled** string (host contains `-pooler`); add `&pgbouncer=true` at the end.
   - `DIRECT_URL`: the **direct** string (pooled toggle off).
3. Create the tables:
   ```bash
   npm install
   npm run db:deploy
   ```
4. Run it: `npm run dev` → http://localhost:3000. Add profiles under **Profiles**.

### Share it with the team (deploy to Vercel, free)

1. Push this repo to GitHub, then go to **vercel.com → Add New Project** and import it.
2. In **Environment Variables**, add `DATABASE_URL` and `DIRECT_URL` (same values as `.env`).
3. Deploy. The `vercel-build` script applies any pending migrations automatically.
   Everyone uses the Vercel URL. On phones, use "Add to Home Screen" for an app-like icon.

## Scripts

| Script               | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Dev server                                     |
| `npm run build`      | Production build (`npm start` to run it)       |
| `npm run lint`       | ESLint                                         |
| `npm run typecheck`  | TypeScript check                               |
| `npm run db:deploy`  | Apply migrations to the database               |
| `npm run db:migrate` | Create a new migration after a schema change   |
| `npm run db:studio`  | Browse/edit the data in Prisma Studio          |

## Tech & why

- **Next.js 15 (App Router) + TypeScript + Tailwind v4**: one codebase for UI and API.
- **PostgreSQL on Neon**: hosted, free for this size, works from anywhere.
- **Prisma (ORM)**: the typed layer the code uses to talk to Postgres, plus versioned migrations.
  It is *not* the database itself.
- **Atomic counters**: `+`/`−` use single-statement increments/decrements that never go below 0,
  so fast taps or several people updating at once never lose counts. The UI updates optimistically,
  rolls back on failure, and re-syncs on focus / every 30s to show teammates' changes.

## Structure

```
prisma/
  schema.prisma          Profile + DailyCount (one row per profile per day)
src/
  app/
    page.tsx             Calendar dashboard (server-loads the month)
    profiles/page.tsx    Manage profiles
    api/counts/          GET ?from&to · POST {profileId,date,metric,delta}
    api/profiles/        GET · POST · PATCH/DELETE /[id]
  components/
    dashboard/           Calendar grid, day cell, day panel, filter, summary
    profiles/            Profile manager
    layout/ ui/          Header, Box, Button, Modal, Stepper, toast
  hooks/                 useCounts (optimistic state), useToday
  lib/                   dates, metrics config, validation (zod), db, http, api client
  server/                Data-access services used by pages and API routes
  types/                 Shared types
```

### Adding another counter (e.g. "Offer")

1. Add `offer Int @default(0)` to `DailyCount` in `prisma/schema.prisma`, then run `npm run db:migrate -- --name add_offer`.
2. Add `"offer"` to `MetricKey` in `src/types/index.ts`, and add an entry to `METRICS` in `src/lib/metrics.ts`.
3. Add `offer` to `countSelect` in `src/server/counts.ts`, to `emptyMetrics()` in `src/lib/metrics.ts`,
   and to the `_sum` lookup in `src/server/profiles.ts`.
