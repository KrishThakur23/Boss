-- Fix Products Table for Public Access
-- This makes all products visible to everyone without authentication

-- First, let's check the current structure of the products table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products';

-- Check if is_active column exists and what values it has
SELECT COUNT(*) as total_products, 
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
       COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_products,
       COUNT(CASE WHEN is_active IS NULL THEN 1 END) as null_active_products
FROM products;

-- Option 1: Update all existing products to be active
UPDATE products SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Option 2: If is_active column doesn't exist, add it and set all products to active
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE products SET is_active = true;
    END IF;
END $$;

-- Option 3: Make products completely public by disabling RLS temporarily for testing
-- WARNING: This removes security, only use for testing!
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Option 4: Create a more permissive policy (recommended)
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Create a policy that allows viewing all products (not just active ones)
CREATE POLICY "Anyone can view all products" ON products
    FOR SELECT USING (true);

-- Alternative: Create a policy that shows products regardless of is_active status
-- CREATE POLICY "Anyone can view all products" ON products
--     FOR SELECT USING (true);

-- Verify the new policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Test: Check if you can see products without authentication
-- This should work now
SELECT COUNT(*) as total_products FROM products;

-- Show some sample products
SELECT id, name, price, in_stock, is_active FROM products LIMIT 5;

