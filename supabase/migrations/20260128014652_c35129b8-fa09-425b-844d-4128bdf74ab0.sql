
-- Drop the problematic policy that can cause recursion
DROP POLICY IF EXISTS "Admins can add other members" ON public.group_members;

-- Create a security definer function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
      AND role = 'admin'
  )
$$;

-- Recreate the admin policy using the security definer function
CREATE POLICY "Admins can add other members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_group_admin(auth.uid(), group_id)
);
