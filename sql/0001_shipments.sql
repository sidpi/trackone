-- 0001_shipments.sql
-- Track 2: shipments table with per-user Row Level Security.
--
-- Run this in the Supabase Dashboard → SQL Editor (or `supabase db push`).

-- ── Table ────────────────────────────────────────────────────────────
create table if not exists public.shipments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  tracking_number text not null,
  courier         text not null,
  nickname        text,
  status          text not null default 'pending'
                    check (status in ('pending', 'in_transit', 'customs', 'delivered', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists shipments_user_id_idx on public.shipments (user_id);
create index if not exists shipments_status_idx on public.shipments (status);

-- ── Row Level Security ───────────────────────────────────────────────
-- Users can only see/manage shipments where user_id = their own auth.uid().
alter table public.shipments enable row level security;

drop policy if exists "Users can view their own shipments" on public.shipments;
create policy "Users can view their own shipments"
  on public.shipments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own shipments" on public.shipments;
create policy "Users can insert their own shipments"
  on public.shipments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own shipments" on public.shipments;
create policy "Users can update their own shipments"
  on public.shipments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own shipments" on public.shipments;
create policy "Users can delete their own shipments"
  on public.shipments for delete
  using (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at
  before update on public.shipments
  for each row
  execute function public.handle_updated_at();

-- ── Grants ───────────────────────────────────────────────────────────
-- Authenticated users (via RLS) get full CRUD on their own rows.
grant select, insert, update, delete on public.shipments to authenticated;
