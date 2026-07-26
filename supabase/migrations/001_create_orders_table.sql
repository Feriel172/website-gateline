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

-- Enable Row Level Security (optional but recommended)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so anyone can place an order)
CREATE POLICY "Allow anonymous inserts" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all orders (for admin panel)
CREATE POLICY "Allow authenticated select" ON orders
  FOR SELECT
  TO authenticated
  USING (true);

