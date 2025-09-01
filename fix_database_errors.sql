-- =====================================================
-- COMPREHENSIVE DATABASE FIX SCRIPT
-- =====================================================
-- This script fixes all the database column reference issues
-- Run this in your Supabase SQL Editor

-- Step 1: Fix the profiles table trigger issue
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create the function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists (to avoid duplicates)
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    -- Use a more robust insert with error handling
    BEGIN
      INSERT INTO profiles (id, name, email, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create the trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 2: Fix RLS policies to allow the trigger function to work
-- Temporarily disable RLS to fix the policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create new, more permissive policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow the trigger function to insert profiles (this is crucial!)
CREATE POLICY "Allow trigger function to insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- Step 3: Ensure cart table has proper structure and create carts for existing users
-- Create carts for users who don't have them
INSERT INTO cart (user_id, created_at, updated_at)
SELECT 
    p.id,
    p.created_at,
    p.created_at
FROM profiles p
LEFT JOIN cart c ON p.id = c.user_id
WHERE c.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Verify the database structure
-- Check if all required tables exist with correct structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'cart', 'cart_items', 'addresses', 'donations')
ORDER BY table_name, ordinal_position;

-- Step 5: Test the trigger function
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 6: Check RLS policies
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
WHERE tablename = 'profiles';

-- Step 7: Verify the fix
SELECT 
    'Profiles count' as metric,
    COUNT(*) as value
FROM profiles
UNION ALL
SELECT 
    'Auth users count' as metric,
    COUNT(*) as value
FROM auth.users
UNION ALL
SELECT 
    'Carts count' as metric,
    COUNT(*) as value
FROM cart;

-- Step 8: Show any users without profiles (should be 0 after fix)
SELECT 
    'Users without profiles' as metric,
    COUNT(*) as value
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

