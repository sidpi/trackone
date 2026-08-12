# SQL migrations

Apply migrations in order with the Supabase CLI (`supabase db push`) or
manually from the Dashboard → **SQL Editor**.

## 0001_shipments.sql — shipments table (Track 2)

Creates `public.shipments` with Row Level Security so every user only sees
their own rows.

| Column            | Type          | Notes                                          |
| ----------------- | ------------- | ---------------------------------------------- |
| `id`              | `uuid`        | PK, default `gen_random_uuid()`                |
| `user_id`         | `uuid`        | FK → `auth.users(id)`, cascades on delete      |
| `tracking_number` | `text`        | required                                       |
| `courier`         | `text`        | required (Ekart, Ecom, Delhivery, …)           |
| `nickname`        | `text`        | optional, nullable                             |
| `status`          | `text`        | default `'pending'`; check-constrained         |
| `created_at`      | `timestamptz` | default `now()`                                |
| `updated_at`      | `timestamptz` | auto-updated by trigger                        |

Allowed statuses: `pending`, `in_transit`, `out_for_delivery`, `customs`,
`delivered`, `cancelled`. (`out_for_delivery` was added by
`0003_out_for_delivery.sql`.)

## 0002_tracking.sql — tracking history + cache (Track 3)

Adds to `shipments`: `tracking_checked_at` (last successful sync),
`tracking_error` (last sync error), `tracking_raw` (cached provider
payload).

Creates `public.tracking_history` (the timeline) with RLS scoped to the
shipment owner via a join on `shipments.user_id`:

| Column       | Type          | Notes                                  |
| ------------ | ------------- | -------------------------------------- |
| `id`         | `uuid`        | PK                                     |
| `shipment_id`| `uuid`        | FK → shipments, cascade delete         |
| `status`     | `text`        | mapped ShipTrack status                |
| `message`    | `text`        | checkpoint message                     |
| `location`   | `text`        | optional                               |
| `occurred_at`| `timestamptz` | checkpoint time                        |
| `raw`        | `jsonb`       | raw provider payload                   |
| `created_at` | `timestamptz` | default `now()`                        |

## 0003_out_for_delivery.sql — distinct "out for delivery" status

Adds `out_for_delivery` to the `shipments.status` check constraint (it was
previously folded into `in_transit`) and backfills any existing shipments
whose cached provider payload already reports the parcel as out for
delivery. Run after `0002_tracking.sql`.

To run all migrations:

```bash
# Option A — Supabase CLI
supabase db push

# Option B — Dashboard
# Supabase → SQL Editor → paste 0001_shipments.sql → Run
# → paste 0002_tracking.sql → Run
# → paste 0003_out_for_delivery.sql → Run
```
