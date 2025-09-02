-- Fix Categories Table Schema
-- Add missing columns to match the expected schema

-- Check if columns exist and add them if they don't
DO $$
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to categories table';
    ELSE
        RAISE NOTICE 'is_active column already exists in categories table';
    END IF;

    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'image_url') THEN
        ALTER TABLE categories ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to categories table';
    ELSE
        RAISE NOTICE 'image_url column already exists in categories table';
    END IF;

    -- Add parent_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id);
        RAISE NOTICE 'Added parent_id column to categories table';
    ELSE
        RAISE NOTICE 'parent_id column already exists in categories table';
    END IF;

    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE 'Added sort_order column to categories table';
    ELSE
        RAISE NOTICE 'sort_order column already exists in categories table';
    END IF;
END $$;

-- Update existing categories to have is_active = true
UPDATE categories SET is_active = true WHERE is_active IS NULL;

-- Show the updated structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Show current categories with new columns
SELECT id, name, description, is_active, sort_order, created_at, updated_at
FROM categories
ORDER BY sort_order, name;
