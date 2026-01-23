-- Add username field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create unique index for username to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can update own username" ON profiles;
DROP POLICY IF EXISTS "Username is visible to all users" ON profiles;

-- Add RLS policy for username updates
-- Allow users to update their own username (including username field)
CREATE POLICY "Users can update own username" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to read username of all profiles
CREATE POLICY "Username is visible to all users" ON profiles
  FOR SELECT USING (true);
