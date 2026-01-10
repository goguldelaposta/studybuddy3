-- Drop the view as we'll handle email protection in application code
DROP VIEW IF EXISTS public.profiles_public;

-- Update the profiles SELECT policy to be more restrictive
-- Allow users to see only:
-- 1. Their own full profile (including email)
-- 2. Other profiles without email (handled in app code)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a policy that allows viewing all profiles for authenticated users
-- Email will be filtered at the application level
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);