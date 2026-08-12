-- 0004_email_discovery.sql
-- Track 4: automatic shipment discovery via connected email accounts.
--
-- Run after 0003_out_for_delivery.sql.
-- Requires the app env var EMAIL_TOKEN_ENCRYPTION_KEY — tokens are
-- encrypted at rest with AES-256-GCM before being written here.

-- ── Shipments: discovery provenance ──────────────────────────
alter table public.shipments
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'email')),
  add column if not exists source_email text,           -- connected email that discovered it
  add column if not exists merchant text,               -- Amazon / Flipkart / Myntra / Meesho / ...
  add column if not exists estimated_delivery timestamptz;

-- Dedupe safety net: one tracking number per user. Remove exact duplicate
-- rows first (keeping the earliest) so the index can be created safely.
-- App-level dedupe in the sync engine is the primary mechanism.
delete from public.shipments a
  using public.shipments b
  where a.user_id = b.user_id
    and upper(trim(a.tracking_number)) = upper(trim(b.tracking_number))
    and a.id > b.id;

create unique index if not exists shipments_user_tracking_idx
  on public.shipments (user_id, upper(trim(tracking_number)));

-- ── Connected email accounts ────────────────────────────────
create table if not exists public.connected_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  provider text not null default 'gmail',
  -- OAuth refresh token, encrypted at rest (AES-256-GCM). Access tokens
  -- are never stored — they are refreshed in memory during each sync.
  refresh_token_encrypted text not null,
  last_sync_at timestamptz,
  last_history_id text,          -- Gmail historyId (future incremental sync)
  last_sync_error text,
  status text not null default 'connected'
    check (status in ('connected', 'error', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists connected_emails_user_email_idx
  on public.connected_emails (user_id, lower(email));

create index if not exists connected_emails_user_idx
  on public.connected_emails (user_id);

-- ── RLS: users only see/manage their own connected emails ───
alter table public.connected_emails enable row level security;

drop policy if exists "Users can view their own connected emails" on public.connected_emails;
create policy "Users can view their own connected emails"
  on public.connected_emails for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own connected emails" on public.connected_emails;
create policy "Users can insert their own connected emails"
  on public.connected_emails for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own connected emails" on public.connected_emails;
create policy "Users can update their own connected emails"
  on public.connected_emails for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own connected emails" on public.connected_emails;
create policy "Users can delete their own connected emails"
  on public.connected_emails for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.connected_emails to authenticated;
