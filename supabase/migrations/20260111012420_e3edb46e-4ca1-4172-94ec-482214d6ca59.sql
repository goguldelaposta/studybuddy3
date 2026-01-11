-- Drop existing SELECT policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles for discovery" ON public.profiles;

-- Create helper function to check if users are connected (share group or conversation)
-- Using SECURITY DEFINER to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.are_users_connected(viewer_id uuid, profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if they share a group
    SELECT 1 FROM group_members gm1
    INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = viewer_id AND gm2.user_id = profile_user_id
  )
  OR EXISTS (
    -- Check if they have a conversation
    SELECT 1 FROM conversations c
    WHERE (c.participant_1 = viewer_id AND c.participant_2 = profile_user_id)
       OR (c.participant_1 = profile_user_id AND c.participant_2 = viewer_id)
  )
$$;

-- Create helper function to get profile visibility setting
-- Using SECURITY DEFINER to avoid infinite recursion when checking privacy_settings
CREATE OR REPLACE FUNCTION public.get_profile_visibility(profile_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    privacy_settings->>'profile_visibility',
    'authenticated'
  )
  FROM profiles
  WHERE user_id = profile_user_id
$$;

-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can view profiles based on privacy settings
-- - 'authenticated': any authenticated user can view
-- - 'connections_only': only users who share a group or have a conversation can view
CREATE POLICY "Respect privacy settings for profile viewing"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() != user_id
  AND (
    -- If visibility is 'authenticated', allow any authenticated user
    public.get_profile_visibility(user_id) = 'authenticated'
    OR
    -- If visibility is 'connections_only', check if they're connected
    (
      public.get_profile_visibility(user_id) = 'connections_only'
      AND public.are_users_connected(auth.uid(), user_id)
    )
  )
);

-- Also update profile_skills to respect privacy settings
DROP POLICY IF EXISTS "Authenticated users can view profile skills" ON public.profile_skills;

CREATE POLICY "View profile skills respecting privacy"
ON public.profile_skills
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- User's own skills
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_skills.profile_id AND profiles.user_id = auth.uid())
    OR
    -- Other users' skills based on privacy settings
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_skills.profile_id
      AND (
        public.get_profile_visibility(p.user_id) = 'authenticated'
        OR (
          public.get_profile_visibility(p.user_id) = 'connections_only'
          AND public.are_users_connected(auth.uid(), p.user_id)
        )
      )
    )
  )
);

-- Also update profile_subjects to respect privacy settings
DROP POLICY IF EXISTS "Authenticated users can view profile subjects" ON public.profile_subjects;

CREATE POLICY "View profile subjects respecting privacy"
ON public.profile_subjects
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- User's own subjects
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_subjects.profile_id AND profiles.user_id = auth.uid())
    OR
    -- Other users' subjects based on privacy settings
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_subjects.profile_id
      AND (
        public.get_profile_visibility(p.user_id) = 'authenticated'
        OR (
          public.get_profile_visibility(p.user_id) = 'connections_only'
          AND public.are_users_connected(auth.uid(), p.user_id)
        )
      )
    )
  )
);