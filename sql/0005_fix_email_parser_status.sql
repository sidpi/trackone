-- 0005: Fix email-parser status false positives.
--
-- The original email parser marked a shipment "delivered" / "cancelled" when
-- the email merely mentioned the words ("we'll email you when your order has
-- been delivered", "easy returns"), so many email-discovered shipments were
-- created with the wrong status.
--
-- This resets ONLY email-discovered shipments that:
--   • are marked delivered or cancelled, AND
--   • have NO tracking history at all (never refreshed against the courier).
--
-- Shipments whose status came from real courier tracking (history exists) or
-- from manual entry are left untouched. After running this, click "Refresh
-- tracking" on any shipment to pull the real courier status.
--
-- Safe to run repeatedly.

UPDATE shipments
SET status = 'pending'
WHERE source = 'email'
  AND status IN ('delivered', 'cancelled')
  AND NOT EXISTS (
    SELECT 1
    FROM tracking_history th
    WHERE th.shipment_id = shipments.id
  );

-- Also clear the stale status from the cached tracking raw data nickname if
-- the parser's summary text carried it into the nickname.
UPDATE shipments
SET nickname = NULL
WHERE source = 'email'
  AND nickname ILIKE '%marked delivered%';
