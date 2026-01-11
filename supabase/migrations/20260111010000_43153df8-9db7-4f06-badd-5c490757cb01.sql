-- Create a secure view that hides sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Update the RLS policy on profiles to be more restrictive
-- Users can only see their own full profile data directly
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create new policy: users can only view their own profile directly
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for viewing limited profile data for messaging/groups context
-- This allows the app to still function for features that need to show user names
CREATE POLICY "Users can view profiles they interact with"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    -- Own profile
    auth.uid() = user_id
    -- Or users in same conversation
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
      AND (c.participant_1 = profiles.user_id OR c.participant_2 = profiles.user_id)
    )
    -- Or members of same group
    OR EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.user_id
    )
  )
);