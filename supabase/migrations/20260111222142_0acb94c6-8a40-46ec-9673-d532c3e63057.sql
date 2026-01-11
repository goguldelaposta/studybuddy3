-- Add GDPR consent fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gdpr_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMP WITH TIME ZONE;