/*
  # Add candidate_id to applications table

  1. Changes
    - Add `candidate_id` column to `applications` table
    - Add foreign key constraint to link with profiles table
    - Update existing user_id references to candidate_id

  2. Security
    - No RLS changes needed as table already has RLS enabled
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'applications' AND column_name = 'candidate_id'
  ) THEN
    -- Add the new column
    ALTER TABLE applications ADD COLUMN candidate_id uuid REFERENCES profiles(id);
    
    -- Copy data from user_id to candidate_id if user_id exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'user_id'
    ) THEN
      UPDATE applications SET candidate_id = user_id;
      
      -- Drop the old column only if it exists
      ALTER TABLE applications DROP COLUMN IF EXISTS user_id;
    END IF;
  END IF;
END $$;