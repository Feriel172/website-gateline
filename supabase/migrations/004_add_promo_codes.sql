-- Migration 004: Add promo_code and discount columns to orders table
-- Supports the promo code feature with percentage-based discounts

ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Create an index on promo_code for analytics
CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON orders (promo_code);
