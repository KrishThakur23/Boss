-- Update Paracetamol Image URL
-- Run this script in Supabase SQL Editor if you already have the medicines table

-- Update the paracetamol image to use the actual Supabase storage URL
UPDATE medicines 
SET image_url = 'https://mjsxgsriufscurbpfkwp.supabase.co/storage/v1/object/public/image/paracetamol.webp'
WHERE name LIKE '%Paracetamol%';

-- Verify the update
SELECT name, image_url FROM medicines WHERE name LIKE '%Paracetamol%';
