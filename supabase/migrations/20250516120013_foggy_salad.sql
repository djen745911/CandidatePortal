/*
  # Enable RLS and set up policies for resumes and storage
  
  1. Security Changes
    - Enable RLS on resumes table
    - Add RLS policies for resumes table (read, insert, delete)
    - Add storage policies for cvs bucket (upload, read, delete)
  
  2. Notes
    - Skipping column rename since user_id already exists
    - All policies are scoped to authenticated users
    - Storage policies use folder-based access control
*/

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policies for resumes table
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

-- Storage policies for cvs bucket
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