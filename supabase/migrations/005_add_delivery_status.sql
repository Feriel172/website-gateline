-- Migration 005: track where a confirmed order is in the shipping pipeline.
-- Separate from `status`, which tracks the confirmation call.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'Pas encore envoyée';

-- 'swap' means the parcel was re-routed to another customer, so this order was
-- never delivered to the person who placed it. 'retour' means it came back.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_valid_delivery_status;
ALTER TABLE orders ADD CONSTRAINT check_valid_delivery_status
  CHECK (delivery_status IN ('Pas encore envoyée', 'Envoyée', 'livrée', 'swap', 'retour'));

-- The swap picker looks up orders that have not shipped yet
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders (delivery_status);

-- Swap tracking: how many times this order's parcel has been re-routed to
-- another customer, and what those re-routings cost in courier fees.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS swap_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS swap_cost NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_swap_count_limit;
ALTER TABLE orders ADD CONSTRAINT check_swap_count_limit
  CHECK (swap_count >= 0 AND swap_count <= 2);
