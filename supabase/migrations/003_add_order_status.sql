-- Migration 003: Add status column to orders table
-- Status values: 'en attente' (pending), 'confirmée' (confirmed), 'annulé' (cancelled)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'en attente';

-- Add a CHECK constraint to ensure only valid status values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_valid_status;
ALTER TABLE orders ADD CONSTRAINT check_valid_status
  CHECK (status IN ('en attente', 'confirmée', 'annulé'));

-- Create an index on status for filtering
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_valid_status;
ALTER TABLE orders ADD CONSTRAINT check_valid_status
  CHECK (status IN ('en attente', 'confirmée', 'annulé'));

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
