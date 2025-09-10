-- Database Update Script for Multiple Image Support
-- Run this in your Supabase SQL Editor

-- Option 1: Add new column (Recommended - keeps existing data)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Option 2: If you want to replace the existing column (uncomment if needed)
-- ALTER TABLE products DROP COLUMN IF EXISTS image_url;
-- ALTER TABLE products ADD COLUMN image_urls TEXT[];

-- Update existing products to have their current image_url in the image_urls array
UPDATE products 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_urls IS NULL;

-- Add index for better performance on image_urls queries
CREATE INDEX IF NOT EXISTS idx_products_image_urls ON products USING GIN (image_urls);

-- Verify the changes
SELECT id, name, image_url, image_urls FROM products LIMIT 5;
