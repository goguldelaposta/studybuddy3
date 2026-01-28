
-- Also create helper function for moderator check
CREATE OR REPLACE FUNCTION public.is_group_admin_or_mod(_user_id uuid, _group_id uuid)
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
      AND role IN ('admin', 'moderator')
  )
$$;

-- Also create helper function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
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
  )
$$;

-- Update the "Admins can remove members" policy
DROP POLICY IF EXISTS "Admins can remove members" ON public.group_members;
CREATE POLICY "Admins can remove members" 
ON public.group_members 
FOR DELETE 
USING (
  public.is_group_admin(auth.uid(), group_id)
  AND user_id <> auth.uid()
);

-- Update the "Admins can update members" policy
DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;
CREATE POLICY "Admins can update members" 
ON public.group_members 
FOR UPDATE 
USING (public.is_group_admin_or_mod(auth.uid(), group_id));

-- Update the "Members can view group members" policy
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
CREATE POLICY "Members can view group members" 
ON public.group_members 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_group_member(auth.uid(), group_id)
);
