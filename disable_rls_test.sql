-- Temporarily disable RLS for testing
-- WARNING: This removes security, only use for testing!

-- Disable RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Test if we can insert data
INSERT INTO user_profiles (user_id, email, first_name, last_name, phone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'test2@example.com',
  'Test2',
  'User2',
  '0987654321'
);

-- Test if we can select data
SELECT * FROM user_profiles;

-- Re-enable RLS when done testing
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
