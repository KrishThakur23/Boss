-- Fix Cart RLS Policies and Cleanup
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT 'Current cart count:' as info, COUNT(*) as count FROM cart;

-- Disable RLS temporarily to clean up
ALTER TABLE cart DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Delete all existing carts for this user (keeping only the latest one)
DELETE FROM cart_items WHERE cart_id IN (
    SELECT id FROM cart 
    WHERE user_id = '80adc011-763b-4fa6-ac23-e5804700eb9e'
    AND id NOT IN (
        SELECT id FROM cart 
        WHERE user_id = '80adc011-763b-4fa6-ac23-e5804700eb9e'
        ORDER BY created_at DESC 
        LIMIT 1
    )
);

DELETE FROM cart 
WHERE user_id = '80adc011-763b-4fa6-ac23-e5804700eb9e'
AND id NOT IN (
    SELECT id FROM cart 
    WHERE user_id = '80adc011-763b-4fa6-ac23-e5804700eb9e'
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Re-enable RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own cart" ON cart;
DROP POLICY IF EXISTS "Users can create their own cart" ON cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON cart;
DROP POLICY IF EXISTS "Users can delete their own cart" ON cart;

DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage their own cart items" ON cart_items;

-- Create NEW simplified policies
CREATE POLICY "Users can view their own cart" ON cart
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cart" ON cart
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cart" ON cart
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cart" ON cart
    FOR DELETE USING (user_id = auth.uid());

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own cart items" ON cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own cart items" ON cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

-- Verify the setup
SELECT 'After cleanup - Cart count:' as info, COUNT(*) as count FROM cart;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('cart', 'cart_items')
ORDER BY tablename, policyname;

-- Test RLS is working (should return 0 or 1 for your user)
SELECT 'RLS Test - Carts visible to current user:' as test, COUNT(*) as count FROM cart;
