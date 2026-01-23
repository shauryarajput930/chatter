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
