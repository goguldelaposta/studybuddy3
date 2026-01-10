-- Drop and recreate the view with SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  full_name,
  bio,
  avatar_url,
  university_id,
  faculty,
  looking_for,
  year_of_study,
  created_at,
  updated_at,
  CASE 
    -- Show email if it's the user's own profile
    WHEN user_id = auth.uid() THEN email
    -- Show email if they have an active conversation
    WHEN EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.participant_1 = auth.uid() AND c.participant_2 = user_id)
         OR (c.participant_2 = auth.uid() AND c.participant_1 = user_id)
    ) THEN email
    -- Otherwise hide email
    ELSE NULL
  END as email
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO authenticated;