-- Complete Storage Fix for product-images bucket
-- Run this in your Supabase SQL Editor

-- 1. First, let's check the current bucket configuration
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- 2. Update the bucket to allow all MIME types and make it public
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = NULL -- Allow all MIME types
WHERE id = 'product-images';

-- 3. Drop all existing policies
DROP POLICY IF EXISTS "Enable upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- 4. Create new, simple policies
CREATE POLICY "Allow all operations for product-images bucket" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public read access for product-images bucket" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- 5. Verify the bucket configuration
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- 6. Check the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
