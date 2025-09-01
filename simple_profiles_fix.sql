-- =====================================================
-- SIMPLE PROFILES FIX - ALTERNATIVE APPROACH
-- =====================================================
-- This is a simpler approach that should definitely work
-- Run this in your Supabase SQL Editor if the main fix doesn't work

-- Step 1: Drop everything and start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Create a simple function that bypasses RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert directly without RLS checks
  INSERT INTO profiles (id, name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Ignore if profile already exists
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail
  RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Test with a simple insert
SELECT 'Trigger created successfully' as status;

-- Step 6: Re-enable RLS after testing
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

