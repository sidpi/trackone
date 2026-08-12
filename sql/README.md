# SQL migrations

Apply migrations in order with the Supabase CLI (`supabase db push`) or
manually from the Dashboard → **SQL Editor**.

## 0001_shipments.sql — shipments table (Track 2)

Creates `public.shipments` with Row Level Security so every user only sees
their own rows.

| Column          | Type        | Notes                                        |
| --------------- | ----------- | -------------------------------------------- |
| `id`            | `uuid`      | PK, default `gen_random_uuid()`              |
| `user_id`       | `uuid`      | FK → `auth.users(id)`, cascades on delete    |
| `tracking_number` | `text`    | required                                     |
| `courier`       | `text`      | required (DHL, FedEx, UPS, …)                |
| `nickname`      | `text`      | optional, nullable                           |
| `status`        | `text`      | default `'pending'`; check-constrained       |
| `created_at`    | `timestamptz` | default `now()`                            |
| `updated_at`    | `timestamptz` | auto-updated by trigger                    |

Allowed statuses: `pending`, `in_transit`, `customs`, `delivered`,
`cancelled`.

RLS policies: `select` / `insert` / `update` / `delete` each scoped to
`auth.uid() = user_id`.

To run it:

```bash
# Option A — Supabase CLI
supabase db push

# Option B — Dashboard
# Supabase → SQL Editor → paste the contents of 0001_shipments.sql → Run
```
