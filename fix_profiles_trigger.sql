-- =====================================================
-- FIX PROFILES TABLE TRIGGER ISSUE - UPDATED VERSION
-- =====================================================
-- This script fixes the issue where profiles are not automatically created
-- when new users sign up. Run this in your Supabase SQL Editor.

-- Step 1: Drop existing trigger and function to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Create an improved function to handle new user signup
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

-- Step 3: Create the trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Fix RLS policies to allow the trigger function to work
-- First, disable RLS temporarily to fix the policies
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

-- Step 5: Test the fix by checking if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 6: Check if the function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 7: Manually create profiles for existing users who don't have them
-- (This will fix the 3 users you mentioned)
INSERT INTO profiles (id, name, email, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.email,
    au.created_at,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 8: Verify the fix
SELECT 
    'Profiles count' as metric,
    COUNT(*) as value
FROM profiles
UNION ALL
SELECT 
    'Auth users count' as metric,
    COUNT(*) as value
FROM auth.users;

-- Step 9: Check RLS policies on profiles table
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
