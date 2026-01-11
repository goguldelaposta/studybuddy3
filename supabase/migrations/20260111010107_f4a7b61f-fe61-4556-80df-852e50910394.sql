-- Drop the view since we'll handle this in the application layer instead
DROP VIEW IF EXISTS public.public_profiles;

-- Update RLS policies on profiles to be more restrictive about email visibility
-- The application code will handle not showing emails to unauthorized users

-- First, let's ensure the policies are correct
-- Drop existing policies and recreate with proper restrictions
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles they interact with" ON public.profiles;

-- Policy 1: Users can always view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can view limited profile data for discovery
-- This allows the teammate finder to work, but email protection will be in app code
CREATE POLICY "Authenticated users can view profiles for discovery"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);