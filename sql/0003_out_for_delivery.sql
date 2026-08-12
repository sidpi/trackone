-- 0003_out_for_delivery.sql
-- Adds "out_for_delivery" as a distinct shipment status (it previously
-- mapped to "in_transit").
--
-- Run after 0002_tracking.sql.

-- 1) Widen the status check constraint (Postgres auto-named the inline
--    constraint from 0001 as shipments_status_check).
alter table public.shipments
  drop constraint if exists shipments_status_check;

alter table public.shipments
  add constraint shipments_status_check
  check (status in ('pending', 'in_transit', 'out_for_delivery', 'customs', 'delivered', 'cancelled'));

-- 2) Backfill: shipments whose cached provider payload already reports the
--    parcel as out for delivery get the new status right away (no need to
--    wait for the next refresh). Guarded in case 0002 hasn't run yet.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'shipments'
      and column_name = 'tracking_raw'
  ) then
    update public.shipments
      set status = 'out_for_delivery'
      where status = 'in_transit'
        and tracking_raw is not null
        and tracking_raw::text ilike '%out_for_delivery%';
  end if;
end $$;
