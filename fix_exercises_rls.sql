-- Fix RLS policies for the standalone exercises table
-- This allows system-created exercises to be inserted and all users to read them

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read exercises" ON exercises;
DROP POLICY IF EXISTS "Allow authenticated users to create exercises" ON exercises;
DROP POLICY IF EXISTS "Allow users to update their own exercises" ON exercises;
DROP POLICY IF EXISTS "Allow users to delete their own exercises" ON exercises;

-- Create new policies for the standalone exercises table
-- Allow all authenticated users to read exercises (system-created and user-created)
CREATE POLICY "Allow authenticated users to read exercises" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create exercises
CREATE POLICY "Allow authenticated users to create exercises" ON exercises
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own exercises (where created_by is not null)
CREATE POLICY "Allow users to update their own exercises" ON exercises
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    created_by IS NULL -- Allow updates to system-created exercises
  );

-- Allow users to delete their own exercises (where created_by is not null)
CREATE POLICY "Allow users to delete their own exercises" ON exercises
  FOR DELETE USING (
    auth.uid() = created_by OR 
    created_by IS NULL -- Allow deletion of system-created exercises
  );

-- Also allow system to insert exercises with null created_by
CREATE POLICY "Allow system to insert exercises" ON exercises
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (created_by IS NULL OR auth.uid() = created_by)
  ); 