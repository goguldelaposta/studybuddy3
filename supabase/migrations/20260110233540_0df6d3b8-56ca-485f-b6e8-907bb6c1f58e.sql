-- Drop the existing public SELECT policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy: only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Also update profile_skills to require authentication
DROP POLICY IF EXISTS "Profile skills are viewable by everyone" ON public.profile_skills;

CREATE POLICY "Authenticated users can view profile skills"
ON public.profile_skills
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Also update profile_subjects to require authentication
DROP POLICY IF EXISTS "Profile subjects are viewable by everyone" ON public.profile_subjects;

CREATE POLICY "Authenticated users can view profile subjects"
ON public.profile_subjects
FOR SELECT
USING (auth.uid() IS NOT NULL);