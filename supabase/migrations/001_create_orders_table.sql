-- Create the orders table for storing checkout information
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  bureau TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- NOTE: Anonymous inserts are now handled via the server-side API route (/api/checkout)
-- which uses the service_role key. This eliminates the need for anonymous insert policies.
-- The service_role key bypasses RLS entirely, so all inserts go through server-side validation.

-- Allow authenticated users to view all orders (for admin panel)
CREATE POLICY "Allow authenticated select" ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to delete orders (admin functionality)
CREATE POLICY "Allow authenticated delete" ON orders
  FOR DELETE
  TO authenticated
  USING (true);

