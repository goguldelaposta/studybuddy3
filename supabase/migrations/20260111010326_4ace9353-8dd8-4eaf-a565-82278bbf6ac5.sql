-- Add privacy settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT jsonb_build_object(
  'show_email', false,
  'show_faculty', true,
  'show_year', true,
  'show_bio', true,
  'show_skills', true,
  'show_subjects', true,
  'profile_visibility', 'authenticated'
);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.privacy_settings IS 'User privacy preferences: show_email, show_faculty, show_year, show_bio, show_skills, show_subjects, profile_visibility (public/authenticated/connections_only)';