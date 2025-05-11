
-- Add media_url column to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT NULL;
