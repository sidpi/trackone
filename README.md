# ShipTrack — Shipment Tracking App

**Track 1:** polished landing page + working login + protected dashboard shell.
**Track 2:** full shipments CRUD — create, edit, delete, and status badges,
with per-user Row Level Security.
**Track 3:** courier tracking — TrackCourier.io + Ship24 integration with a
status timeline, caching, and error handling.
**Track 4:** automatic shipment discovery — connect multiple email accounts
(OAuth) and shipments are extracted from order emails automatically.

A Next.js (App Router) web app for tracking shipments, built with TypeScript,
Tailwind CSS, shadcn/ui, and Supabase (Auth + Postgres). Deployed to
**Cloudflare** via the OpenNext adapter, behind the custom domain
**`track.sidcandev.online`** (a subdomain of `sidcandev.online`).

---

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, TypeScript)                 |
| Styling    | Tailwind CSS v4 + shadcn/ui (Base UI components)              |
| Auth       | Supabase Auth via `@supabase/ssr` (email + password)          |
| Database   | PostgreSQL hosted on Supabase (RLS-ready, schema in `sql/`)   |
| Hosting    | Cloudflare (Workers runtime) via `@opennextjs/cloudflare`     |
| Domain     | `track.sidcandev.online`                                     |

---

## Getting started

### 1. Prerequisites

- Node.js **20+** (this repo was scaffolded with Node 26)
- npm
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Cloudflare](https://dash.cloudflare.com) account with the
  `sidcandev.online` domain attached (for deployment — we use the
  `track.` subdomain)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the Supabase values (see below). For Cloudflare preview/deploy also:

```bash
cp .dev.vars.example .dev.vars
```

> `.env.local` is gitignored. The Supabase **anon key** is safe to expose in
> the browser — real security comes from Postgres Row Level Security.

### 4. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Authentication → Providers → Email** — make sure "Email" is enabled.
3. **Authentication → URL Configuration** — add your site URLs:
   - Local: `http://localhost:3000`
   - Production: `https://track.sidcandev.online`
4. Copy the project URL + anon key from **Project Settings → API** into
   `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

5. Create your first user: **Authentication → Users → Add user** (email +
   password). Sign-ups can be enabled later under **Auth → Providers**.

> Using the Supabase CLI locally instead? Run `supabase start` and point
> `NEXT_PUBLIC_SUPABASE_URL` at `http://127.0.0.1:54321` (anon key is
> `eyJhbGciOi...` printed by the CLI).

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000. Sign in with the user you created — you'll land
on the protected dashboard.

---

## What's inside

| Route                 | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `/`                   | Landing page (hero, features, roadmap, CTA)              |
| `/login`              | Sign-in page (Supabase email + password)                 |
| `/dashboard`          | Protected dashboard: unified shipment list, filters, Sync Now, create/edit/delete |
| `/dashboard/shipments/[id]` | Shipment details: tracking timeline, refresh, error states |
| `/dashboard/settings` | Settings: connected email accounts (sync, disconnect)   |
| `/api/tracking/refresh`    | Secure serverless fn: fetches courier status, updates history |
| `/api/emails/connect`      | Starts Google OAuth for connecting an email account     |
| `/api/emails/callback`     | OAuth callback: stores encrypted token, saves connection |
| `/api/emails/sync`         | Syncs one or all connected emails (also cron entry point) |
| `/api/emails/disconnect`   | Disconnects an email (keeps discovered shipments)       |
| `/auth/callback`      | OAuth/magic-link code exchange (ready for future providers) |
| `/auth/signout`       | POST route that signs the user out                       |

### Auth flow

- `src/middleware.ts` (Edge runtime) refreshes the Supabase session on every
  request and redirects anonymous users away from `/dashboard`.
- Server Components use `src/lib/supabase/server.ts` (cookie-based client);
  the dashboard layout double-checks the session server-side.
- Client Components use `src/lib/supabase/client.ts`.

### Why `middleware.ts` and not Next 16's `proxy.ts`?

Next 16 renamed middleware to `proxy.ts` and made it default to the **Node.js
runtime**. The OpenNext Cloudflare adapter does not support Node middleware
yet, so this repo keeps the legacy `middleware.ts` convention (Edge runtime),
which OpenNext fully supports. When OpenNext adds `proxy.ts` support, rename
the file and function (`middleware` → `proxy`) — no other changes needed.

---

## Folder structure

```
.
├── src/
│   ├── app/                     # App Router routes
│   │   ├── layout.tsx           # Root layout (fonts, theme, toaster)
│   │   ├── page.tsx             # Landing page
│   │   ├── login/page.tsx       # Sign-in page
│   │   ├── dashboard/           # Protected area
│   │   │   ├── layout.tsx       # Auth guard + app shell
│   │   │   ├── page.tsx         # Fetches shipments (RLS), renders list
│   │   │   ├── actions.ts       # Server actions: create/update/delete
│   │   │   ├── settings/        # Connected Emails settings page
│   │   └── shipments/[id]/  # Details page + tracking timeline
│   │   ├── api/emails/      # connect / callback / sync / disconnect
│   │   ├── api/tracking/refresh/route.ts  # Serverless tracking refresher
│   │   └── auth/                # Auth route handlers
│   │       ├── callback/route.ts
│   │       └── signout/route.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (generated)
│   │   ├── landing/             # Landing page sections
│   │   ├── auth/                # Login form
│   │   └── dashboard/           # Shipment dialog, table, status badge,
│   │                            # timeline, refresh button, row actions
│   ├── lib/
│   │   ├── utils.ts             # cn() helper
│   │   ├── format.ts            # timeAgo / formatDateTime
│   │   ├── types.ts             # Shipment + tracking types
│   │   ├── couriers.ts          # Courier list (slugs live in providers)
│   │   ├── tracking/            # Providers (types, index, infer, mock,
│   │   │                        # trackcourier.ts, ship24.ts)
│   │   ├── emails/              # Email discovery (Track 4): OAuth, Gmail
│   │   │   │                    # client, encryption, sync engine, and the
│   │   │   └── parsers/         # modular parsers (Amazon, Flipkart, …)
│   │   ├── emails/              # Email discovery (Track 4): OAuth flow,
│   │   │   │                    # Gmail client, encryption, sync engine,
│   │   │   └── parsers/         # modular parsers (Amazon, Flipkart, …)
│   │   └── supabase/            # client.ts, server.ts
│   └── middleware.ts            # Session refresh + route guard (Edge)
├── sql/                         # Postgres migrations
│   ├── README.md
│   ├── 0001_shipments.sql       # shipments table + RLS (Track 2)
│   ├── 0002_tracking.sql        # history table + cache cols (Track 3)
│   ├── 0003_out_for_delivery.sql # distinct "out for delivery" status
│   └── 0004_email_discovery.sql # connected emails + source cols (Track 4)
├── public/_headers              # Static asset caching (Cloudflare)
├── wrangler.jsonc               # OpenNext / Wrangler config
├── .env.example                 # Documented env vars
├── .dev.vars.example            # Wrangler local runtime vars
└── next.config.ts
```

---

## Scripts

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Next.js dev server (Node runtime)                   |
| `npm run build`     | Standard Next.js production build                   |
| `npm run lint`      | ESLint                                              |
| `npm run preview`   | OpenNext build + run locally on the Workers runtime |
| `npm run deploy`    | OpenNext build + deploy to Cloudflare               |
| `npm run upload`    | OpenNext build + upload a new version               |

---

## Deployment — Cloudflare (custom domain: track.sidcandev.online)

The app deploys with the **OpenNext Cloudflare adapter**, which runs Next.js
on Cloudflare's Workers runtime. Workers supports custom domains directly.

### 1. First deploy from your machine

Make sure `.env.local` has the Supabase values (they're inlined at build
time), then:

```bash
npm run deploy
```

Wrangler will ask you to log in to Cloudflare once. The Worker is named
`shipmenttracker` (see `wrangler.jsonc`).

### 2. Attach your custom domain

In the Cloudflare dashboard → **Workers & Pages → shipmenttracker →
Settings → Domains & Routes**:

1. **Custom Domains** → *Add* → enter `track.sidcandev.online`. Because the
   parent domain is already on Cloudflare, the DNS record is created
   automatically (this is also declared in `wrangler.jsonc` below).

Or declare it in `wrangler.jsonc` (already included in this repo):

```jsonc
"routes": [{ "pattern": "track.sidcandev.online", "custom_domain": true }]
```

> Tip: if you ever want the app at the root domain too, add a second route
> with `"pattern": "sidcandev.online"` and update the Supabase redirect URLs.

### 3. Environment variables in production

In the Worker dashboard → **Settings → Variables and Secrets**:

| Variable                       | Type    | Value                                       |
| ------------------------------ | ------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Text    | your Supabase project URL                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Text    | your Supabase anon key                      |
| `NEXT_PUBLIC_SITE_URL`         | Text    | `https://track.sidcandev.online`            |
| `TRACKCOURIER_API_KEY`         | Secret  | your TrackCourier.io API key                |
| `SHIP24_API_KEY`               | Secret  | your Ship24 API key                         |
| `INDIAN_COURIER_API_URL`       | Text    | URL of your hosted indian-courier-api service |
| `TRACKING_CACHE_TTL_MINUTES`   | Text    | `15` (optional)                             |
| `GOOGLE_OAUTH_CLIENT_ID`       | Text    | Google OAuth client id (email discovery)    |
| `GOOGLE_OAUTH_CLIENT_SECRET`   | Secret  | Google OAuth client secret                  |
| `EMAIL_TOKEN_ENCRYPTION_KEY`   | Secret  | 32-byte base64 key to encrypt tokens        |

`NEXT_PUBLIC_*` values are also inlined at **build** time — if you build in
CI, set them there too. Provider keys are **runtime secrets**: store them as
Worker secrets (never in code or build vars). Without any keys the app falls
back to the demo/mock provider.

### 4. Continuous deployment (recommended)

Push the repo to GitHub, then in Cloudflare Dashboard → **Workers & Pages →
Create → Connect to Git**. Cloudflare builds with `npm run deploy` on every
push to the production branch. Keep secrets in the Worker's
**Variables and Secrets** settings.

### 5. Update Supabase URL configuration

Add `https://track.sidcandev.online` to **Authentication → URL Configuration**
(redirect URLs) in Supabase so auth callbacks resolve correctly.

### Windows note

OpenNext works on Windows but is only *fully supported* on Linux/macOS. If
you hit build issues locally, run `npm run deploy` from WSL or use the
GitHub → Cloudflare CI path instead.

---

## Track 2 — Shipments (live)

- `sql/0001_shipments.sql` — the `shipments` table with RLS policies; run it
  from the Supabase **SQL Editor** or `supabase db push`. See `sql/README.md`.
- Dashboard lists the signed-in user's shipments (RLS-scoped), with status
  badges (`pending`, `in_transit`, `out_for_delivery`, `customs`,
  `delivered`, `cancelled`).
- **Add Shipment** opens a modal: tracking number, courier dropdown, optional
  nickname. **Edit** also allows changing the status. **Delete** removes a row.
- All mutations run through server actions in `src/app/dashboard/actions.ts`
  with input validation; the `user_id` is always set from the session, so a
  user can never create rows for someone else.

## Track 3 — Courier tracking (live)

- Run `sql/0002_tracking.sql` after `0001` (history table + cache columns),
  then `sql/0003_out_for_delivery.sql` (adds the distinct
  `out_for_delivery` status).
- Click any shipment row → **details page** with a tracking timeline.
  **Refresh tracking** calls `POST /api/tracking/refresh`.
- That route is a secure serverless function: it only refreshes shipments
  owned by the signed-in user (RLS + explicit lookup), and the courier API
  keys (e.g. `TRACKCOURIER_API_KEY`) never leave the server. Provider
  responses are mapped into ShipTrack statuses, new checkpoints are appended to
  `tracking_history` (deduped), and the shipment status is updated.
- **Caching**: a successful refresh is cached via `tracking_checked_at` for
  `TRACKING_CACHE_TTL_MINUTES` (default 15) — no external call on repeat
  refreshes within the window.
- **Error states**: provider failures are persisted to `tracking_error` and
  shown on the details page; the endpoint returns proper HTTP codes
  (401/400/404/502) and the UI surfaces them via toasts.
- **Providers** (swappable interface in `src/lib/tracking/`):
  1. **TrackCourier.io** (`trackcourier.ts`) — when `TRACKCOURIER_API_KEY`
     is set. Indian-first, 25+ couriers; free tier is 100 requests/month.
  2. **Ship24** (`ship24.ts`) — when `SHIP24_API_KEY` is set. Global
     aggregator with courier auto-detection.
  3. **indian-courier-api** — your self-hosted scraper service
     (github.com/rajatdhoot123/indian-courier-api) when
     `INDIAN_COURIER_API_URL` is set. See "Deploying the Indian courier
     tracking service" below.
  4. **mock** — clearly-labeled simulated timeline when none are
     configured, so the feature stays demoable locally.

  When more than one real provider is configured they form a **failover
  chain**: each is tried in order until one returns data (a tracking number
  unknown to TrackCourier can be resolved by Ship24, and vice versa). The
  15-minute cache also keeps provider quota usage low.

### Deploying the Indian courier tracking service

The `indian-courier-api` repo is a **web scraper**: it launches a headless
Chromium browser and scrapes AfterShip's public tracking pages. It therefore
needs a Chromium-capable host — it **cannot** run on Cloudflare Workers.

```bash
git clone https://github.com/rajatdhoot123/indian-courier-api.git
cd indian-courier-api
npm install
npm start        # or deploy to any Node/Chromium host (Render, VPS, …)
```

Then point our app at it:

```
INDIAN_COURIER_API_URL=https://your-tracking-service.example.com
```

Our app calls `GET {INDIAN_COURIER_API_URL}/api/track/{courier}/{trackingId}`
and maps `{ data: [{ location, detail, date }] }` into the same timeline
format as the other providers.

> ⚠️ **Known issue (verified Aug 2026):** the scraper's DOM selectors
> (`#shipment-result-card`, `.checkpoint__detail`) are from AfterShip's
> pre-2023 site and no longer exist — the tracking widget is now a minified
> Svelte app with unstable generated IDs. Real tracking through this service
> **does not currently work**, and scrapers are fragile by nature. The
> **TrackCourier.io and Ship24** are the supported path (see above); the
> mock provider keeps the app demoable in the meantime.

## Roadmap

- **Track 1 (done)** — Landing page, Supabase auth, dashboard shell.
- **Track 2 (done)** — Shipments CRUD, status badges, RLS.
- **Track 3 (done)** — Courier tracking (TrackCourier + Ship24), timeline, caching.
- **Track 4 (done)** — Automatic shipment discovery from connected emails.

---

## Track 4 — Automatic email discovery (live)

Connect one or more email accounts (Gmail via Google OAuth) and the app
finds shipment/order emails, extracts tracking numbers, and adds them to the
same dashboard as your manual shipments.

### 1. Run the migration

Run `sql/0004_email_discovery.sql` in Supabase → SQL Editor (after 0001–0003).
It adds `source` / `source_email` / `merchant` / `estimated_delivery` to
`shipments`, a per-user tracking-number uniqueness index, and the
`connected_emails` table (encrypted token storage + RLS).

### 2. Set up Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → create a
   project (or pick one) → **APIs & Services → Library** → enable the
   **Gmail API**.
2. **APIs & Services → OAuth consent screen** → External → add your email
   as a test user.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
   Add an authorized redirect URI:
   - Local: `http://localhost:3000/api/emails/callback`
   - Production: `https://track.sidcandev.online/api/emails/callback`
4. Copy the client ID/secret into `.env.local` (and Worker secrets):
   `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`.
5. Generate an encryption key and set `EMAIL_TOKEN_ENCRYPTION_KEY`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### 3. Connect an email

**Dashboard → Settings → Connected Emails → Connect another email**.
You'll be taken to Google's consent screen (Gmail read-only scope). The app
never asks for your password and never stores email content — only the
refreshed tracking facts. Each connected account has its own **Sync Now**,
**Last synced** time, and **Disconnect**.

### 4. How discovery works

1. **Scan** — the sync queries recent Gmail (`newer_than:90d` + shipment
   keywords). Only cheap headers (subject + from) are fetched for filtering.
2. **Parse** — modular parsers in `src/lib/emails/parsers/` (Amazon,
   Flipkart, Myntra, Meesho + generic courier notifications) detect the
   merchant/courier and extract the tracking/AWB number, estimated delivery
   and status. Adding a merchant = one new parser file registered in
   `parsers/index.ts`.
3. **Dedupe** — a tracking number that already exists for the user (added
   manually or discovered earlier) is **associated** with the existing
   shipment (`source_email` is set), never duplicated. The DB also enforces
   a per-user unique index as a safety net.
4. **Create** — new shipments get `source = 'email'`, the discovering email
   in `source_email`, the merchant, and an estimated delivery when found.
   Refresh tracking works exactly like manual shipments.

### 5. Security model

- Google **OAuth** only — passwords are never requested.
- The **refresh token is encrypted at rest** (AES-256-GCM, key in
  `EMAIL_TOKEN_ENCRYPTION_KEY`); access tokens live only in memory during a
  sync. Tokens are never sent to the browser.
- **RLS** on `connected_emails` and `shipments` keeps every user's data
  private. `refresh_token_encrypted` is never selected by the UI.
- Disconnecting revokes the Google token (best effort) and deletes the
  connection row — **existing discovered shipments are kept**.
- Minimal data: email bodies are parsed in memory and discarded; only
  tracking facts are stored.

### 6. Background sync (Cloudflare-ready)

Sync is idempotent and lives in a plain function
(`syncAllConnectedEmails` in `src/lib/emails/sync.ts`) that `POST
/api/emails/sync` calls without an `emailId` to sync every connected
account. To add scheduled sync later, point a Cloudflare **Cron Trigger**
at that endpoint (protect it with a service token) — no code changes
needed in the sync engine.

### 7. Manual flow is unchanged

The **Add Shipment** button, manual create/edit/delete, status badges, and
refresh tracking all work exactly as before. Discovered shipments simply
join the same list.

---

## Common issues

- **"Invalid login credentials"** — wrong email/password, or the user was
  created with a different auth provider. Check **Auth → Users**.
- **Session not persisting after deploy** — make sure `NEXT_PUBLIC_SUPABASE_URL`
  is set as a Worker variable *and* in the build environment, and that
  `https://track.sidcandev.online` is in Supabase's allowed redirect URLs.
- **Middleware deprecation warning** — expected on Next 16; see the
  `proxy.ts` note above.
