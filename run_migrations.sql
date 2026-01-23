-- You can run this SQL directly in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/ffpzdptfeeulbyxjktvo/sql

-- First, run the online status migration if not already done:
-- Add online status fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);

-- Add RLS policies for online status
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can update own online status" ON profiles;
DROP POLICY IF EXISTS "Online status is visible to all users" ON profiles;

-- Allow users to update their own online status
CREATE POLICY "Users can update own online status" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to read online status of all profiles
CREATE POLICY "Online status is visible to all users" ON profiles
  FOR SELECT USING (true);

-- Now run the username migration:
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

-- Success message
SELECT 'Username and online status migrations completed successfully!' as result;
