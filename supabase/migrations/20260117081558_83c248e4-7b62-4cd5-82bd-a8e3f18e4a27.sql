-- Add online_status column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'online' CHECK (online_status IN ('online', 'offline'));

-- Add last_seen timestamp for tracking activity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();