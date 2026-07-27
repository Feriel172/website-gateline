-- Migration 002: Add rate limiting and additional security measures

-- 1. Create an index on phone + created_at for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_orders_phone_created_at ON orders (phone, created_at DESC);

-- 2. Create a function to check order frequency (rate limiting helper)
-- This can be used by the API route to prevent spam submissions
CREATE OR REPLACE FUNCTION check_order_rate_limit(p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count orders from the same phone number in the last 5 minutes
  SELECT COUNT(*) INTO recent_count
  FROM orders
  WHERE phone = p_phone
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- Allow max 3 orders per phone number per 5 minutes
  RETURN recent_count < 3;
END;
$$;

-- 3. Add a CHECK constraint to ensure valid delivery types
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_valid_delivery_type;
ALTER TABLE orders ADD CONSTRAINT check_valid_delivery_type
  CHECK (delivery_type IN ('À domicile', 'Bureau ZR Express'));

-- 4. Add a CHECK constraint to ensure total is positive
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_total_positive;
ALTER TABLE orders ADD CONSTRAINT check_total_positive
  CHECK (total > 0);

-- 5. Add a CHECK constraint to ensure phone format is valid (basic validation)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_phone_format;
ALTER TABLE orders ADD CONSTRAINT check_phone_format
  CHECK (phone ~ '^0[5-7][0-9]{8}$');

