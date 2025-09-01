-- Update users table to add missing columns
-- Run this in your Supabase SQL Editor if you haven't already

-- Add first_name and last_name columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing records to have some default values
UPDATE users 
SET 
  first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
  last_name = COALESCE(last_name, CASE 
    WHEN POSITION(' ' IN full_name) > 0 
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END)
WHERE first_name IS NULL OR last_name IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
