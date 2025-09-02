-- Fix products table to ensure all required columns exist
-- Run this in your Supabase SQL editor if you're missing columns

-- Add requires_prescription column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' 
                   AND column_name = 'requires_prescription') THEN
        ALTER TABLE products ADD COLUMN requires_prescription BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add other potentially missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' 
                   AND column_name = 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' 
                   AND column_name = 'is_active') THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;