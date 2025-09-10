-- Fix Storage Policies for product-images bucket
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- 2. Create new policies
CREATE POLICY "Enable upload for authenticated users" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Enable update for authenticated users" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- 3. Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- 4. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';