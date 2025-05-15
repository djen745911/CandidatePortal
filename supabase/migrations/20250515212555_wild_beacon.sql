/*
  # Fix CV Storage Access

  1. Changes
    - Rename candidate_id to user_id in resumes table
    - Update storage policies for cvs bucket
    - Add RLS policies for resumes table

  2. Security
    - Enable RLS on resumes table
    - Add policies for authenticated users to manage their own resumes
    - Add storage policies for CV access
*/

-- Rename candidate_id to user_id in resumes table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resumes' AND column_name = 'candidate_id'
  ) THEN
    ALTER TABLE resumes RENAME COLUMN candidate_id TO user_id;
  END IF;
END $$;

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