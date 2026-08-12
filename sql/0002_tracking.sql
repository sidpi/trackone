-- 0002_tracking.sql
-- Track 3: courier tracking — history timeline + caching columns.
--
-- Run after 0001_shipments.sql. Works with any provider (AfterShip, mock).

-- ── New columns on shipments ─────────────────────────────────────────
alter table public.shipments
  add column if not exists tracking_checked_at timestamptz, -- last successful sync
  add column if not exists tracking_error text,             -- last sync error message
  add column if not exists tracking_raw jsonb;              -- last provider payload (cache)

-- ── Tracking history (the timeline) ──────────────────────────────────
create table if not exists public.tracking_history (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status      text,             -- mapped ShipTrack status (pending/in_transit/...)
  message     text not null,
  location    text,
  occurred_at timestamptz not null,
  raw         jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists tracking_history_shipment_idx
  on public.tracking_history (shipment_id, occurred_at desc);

-- ── RLS: users only see history for their own shipments ──────────────
alter table public.tracking_history enable row level security;

drop policy if exists "Users can view their shipments' history" on public.tracking_history;
create policy "Users can view their shipments' history"
  on public.tracking_history for select
  using (exists (
    select 1 from public.shipments s
    where s.id = shipment_id and s.user_id = auth.uid()
  ));

drop policy if exists "Users can add history to their shipments" on public.tracking_history;
create policy "Users can add history to their shipments"
  on public.tracking_history for insert
  with check (exists (
    select 1 from public.shipments s
    where s.id = shipment_id and s.user_id = auth.uid()
  ));

drop policy if exists "Users can update their shipments' history" on public.tracking_history;
create policy "Users can update their shipments' history"
  on public.tracking_history for update
  using (exists (
    select 1 from public.shipments s
    where s.id = shipment_id and s.user_id = auth.uid()
  ));

drop policy if exists "Users can delete their shipments' history" on public.tracking_history;
create policy "Users can delete their shipments' history"
  on public.tracking_history for delete
  using (exists (
    select 1 from public.shipments s
    where s.id = shipment_id and s.user_id = auth.uid()
  ));

grant select, insert, update, delete on public.tracking_history to authenticated;
