-- Fix Profile Data Issue
-- Run this in your Supabase SQL Editor

-- First, let's check what's in the users table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if the users table has the correct structure
-- If not, recreate it with proper columns
DO $$ 
BEGIN
    -- Check if first_name column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        -- Add missing columns
        ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
        RAISE NOTICE 'Added missing columns to users table';
    END IF;
END $$;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recreate RLS policies with proper syntax
CREATE POLICY "Users can view own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Check if there are any existing user profiles
SELECT 
    id,
    email,
    first_name,
    last_name,
    phone,
    created_at
FROM users 
LIMIT 5;

-- If you have existing users without profile data, you can update them
-- (Replace 'your-email@example.com' with actual email)
-- UPDATE users 
-- SET 
--     first_name = 'Default',
--     last_name = 'User',
--     phone = '0000000000'
-- WHERE email = 'your-email@example.com';

-- Test the policies by checking if a user can see their own data
-- This should work for authenticated users
SELECT 
    'RLS Test' as test_type,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'User authenticated'
        ELSE 'User not authenticated'
    END as auth_status,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'Should be able to see own data'
        ELSE 'Cannot see any data'
    END as access_status;
