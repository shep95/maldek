
-- Add suspension fields to profiles table
ALTER TABLE profiles 
ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN suspension_reason TEXT,
ADD COLUMN suspension_end TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when checking suspensions
CREATE INDEX idx_profiles_suspension ON profiles(is_suspended, suspension_end);
