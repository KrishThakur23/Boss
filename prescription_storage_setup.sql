-- Create a storage bucket for prescriptions
-- Note: This needs to be run in the Supabase dashboard under Storage

-- 1. Go to Storage in your Supabase dashboard
-- 2. Click "Create a new bucket"
-- 3. Set bucket name: "prescriptions"
-- 4. Set public bucket: false (for security)
-- 5. Set file size limit: 10MB
-- 6. Set allowed MIME types: image/*, application/pdf

-- Storage bucket policies for prescriptions
-- These policies will be automatically created when you create the bucket

-- Policy for users to upload their own prescriptions
-- CREATE POLICY "Users can upload own prescriptions" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'prescriptions' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy for users to view their own prescriptions
-- CREATE POLICY "Users can view own prescriptions" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'prescriptions' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy for users to update their own prescriptions
-- CREATE POLICY "Users can update own prescriptions" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'prescriptions' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy for users to delete their own prescriptions
-- CREATE POLICY "Users can delete own prescriptions" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'prescriptions' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy for admins to view all prescriptions
-- CREATE POLICY "Admins can view all prescriptions" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'prescriptions' AND
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
--     )
--   );

-- Note: The actual storage bucket creation and policy setup is done through the Supabase dashboard
-- This file serves as a reference for the policies that should be in place
