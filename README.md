# ShipTrack — Shipment Tracking App

**Track 1:** polished landing page + working login + protected dashboard shell.
**Track 2:** full shipments CRUD — create, edit, delete, and status badges,
with per-user Row Level Security.

A Next.js (App Router) web app for tracking shipments, built with TypeScript,
Tailwind CSS, shadcn/ui, and Supabase (Auth + Postgres). Deployed to
**Cloudflare** via the OpenNext adapter, behind the custom domain
**`track.sidcandev.online`** (a subdomain of `sidcandev.online`).

> Courier tracking APIs are intentionally **not** built yet — that's Track 3.
> Shipments are stored locally in Postgres with manual status updates.

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
| `/dashboard`          | Protected dashboard: shipments list, status badges, create/edit/delete |
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
│   │   │   └── actions.ts       # Server actions: create/update/delete
│   │   └── auth/                # Auth route handlers
│   │       ├── callback/route.ts
│   │       └── signout/route.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (generated)
│   │   ├── landing/             # Landing page sections
│   │   ├── auth/                # Login form
│   │   └── dashboard/           # Shipment dialog, table, status badge,
│   │                            # row actions, header, user menu
│   ├── lib/
│   │   ├── utils.ts             # cn() helper
│   │   ├── types.ts             # Shipment types + statuses
│   │   ├── couriers.ts          # Static courier list (no API yet)
│   │   └── supabase/            # client.ts, server.ts
│   └── middleware.ts            # Session refresh + route guard (Edge)
├── sql/                         # Postgres migrations
│   ├── README.md
│   └── 0001_shipments.sql       # shipments table + RLS (Track 2)
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

`NEXT_PUBLIC_*` values are also inlined at **build** time — if you build in
CI, set them there too.

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
  badges (`pending`, `in_transit`, `customs`, `delivered`, `cancelled`).
- **Add Shipment** opens a modal: tracking number, courier dropdown, optional
  nickname. **Edit** also allows changing the status. **Delete** removes a row.
- All mutations run through server actions in `src/app/dashboard/actions.ts`
  with input validation; the `user_id` is always set from the session, so a
  user can never create rows for someone else.
- Couriers are a static list in `src/lib/couriers.ts` — no courier API yet.

## Roadmap

- **Track 1 (done)** — Landing page, Supabase auth, dashboard shell.
- **Track 2 (done)** — Shipments CRUD, status badges, RLS.
- **Track 3 (planned)** — Live courier tracking, notifications, analytics.

---

## Common issues

- **"Invalid login credentials"** — wrong email/password, or the user was
  created with a different auth provider. Check **Auth → Users**.
- **Session not persisting after deploy** — make sure `NEXT_PUBLIC_SUPABASE_URL`
  is set as a Worker variable *and* in the build environment, and that
  `https://track.sidcandev.online` is in Supabase's allowed redirect URLs.
- **Middleware deprecation warning** — expected on Next 16; see the
  `proxy.ts` note above.
