-- Fix Supabase Storage Setup for Product Images
-- Run this in your Supabase SQL Editor

-- 1. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- 2. Create RLS policies for the product-images bucket

-- Policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy for authenticated users to update their own images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

-- Policy for authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- Policy for public read access to product images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- 3. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Check if the bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'product-images';
