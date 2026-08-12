# SQL migrations

Reserved for **Track 2** — the Postgres schema for shipments.

Run migrations with `supabase db push` (Supabase CLI) or from the Supabase
Dashboard → SQL Editor.

Draft for later (not applied yet):

```sql
-- create table shipments (
--   id uuid primary key default gen_random_uuid(),
--   owner_id uuid not null references auth.users(id) on delete cascade,
--   tracking_number text not null,
--   origin text,
--   destination text,
--   status text not null default 'pending',
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now()
-- );
--
-- alter table shipments enable row level security;
```
