-- Fix the security definer view issue by recreating with security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  faculty,
  university_id,
  bio,
  avatar_url,
  looking_for,
  year_of_study,
  user_id,
  created_at,
  updated_at,
  -- Only show email to the profile owner
  CASE 
    WHEN user_id = auth.uid() THEN email
    ELSE NULL
  END as email
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;