/*
  # Fix CV storage access and permissions

  1. Security
    - Enable RLS on resumes table if not already enabled
    - Add RLS policies for resumes table CRUD operations
    - Add storage policies for CV uploads and access

  2. Changes
    - Ensures proper RLS policies exist for resumes table
    - Adds storage bucket policies for CV management
    - Handles existing column name gracefully
*/

-- Enable RLS on resumes table if not already enabled
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

-- Create policies for resumes table
CREATE POLICY "Users can read own resumes"
ON resumes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own resumes"
ON resumes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own resumes"
ON resumes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own CVs" ON storage.objects;

-- Create storage policies for cvs bucket
CREATE POLICY "Users can upload own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);