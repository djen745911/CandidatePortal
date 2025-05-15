/*
  # Add Storage RLS Policies for CVs

  1. Changes
    - Add RLS policies for CV storage bucket
    - Enable RLS on resumes table
    - Add policies for resume access

  2. Security
    - Users can only access their own CVs
    - Users can only upload to their own folder
    - Users can only view their own resume records
*/

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own resumes
CREATE POLICY "Users can read own resumes"
ON resumes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy for users to insert their own resumes
CREATE POLICY "Users can insert own resumes"
ON resumes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy for users to delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON resumes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Storage policies for CV bucket
CREATE POLICY "Users can upload own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);