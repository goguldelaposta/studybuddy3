-- Enable RLS on the view by recreating it with proper security
-- Note: Views inherit RLS from underlying tables, but we need to ensure proper access
-- The profiles_public view already has SECURITY INVOKER, meaning it uses the caller's permissions
-- The underlying profiles table already has RLS enabled

-- First, let's check if the view needs adjustment - we'll recreate with explicit security
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.bio,
  p.avatar_url,
  p.university_id,
  p.faculty,
  p.looking_for,
  p.year_of_study,
  p.created_at,
  p.updated_at,
  CASE 
    -- Show email if it's the user's own profile
    WHEN p.user_id = auth.uid() THEN p.email
    -- Show email if they have an active conversation
    WHEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.participant_1 = auth.uid() AND c.participant_2 = p.user_id)
         OR (c.participant_2 = auth.uid() AND c.participant_1 = p.user_id)
    ) THEN p.email
    -- Otherwise hide email
    ELSE NULL
  END as email
FROM public.profiles p
WHERE auth.uid() IS NOT NULL;

-- Grant access to the view only to authenticated users
REVOKE ALL ON public.profiles_public FROM anon;
GRANT SELECT ON public.profiles_public TO authenticated;