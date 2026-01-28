
-- Update the "Group admins can delete groups" policy to use the security definer function
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.groups;
CREATE POLICY "Group admins can delete groups" 
ON public.groups 
FOR DELETE 
USING (public.is_group_admin(auth.uid(), id));

-- Update the "Group admins can update groups" policy
DROP POLICY IF EXISTS "Group admins can update groups" ON public.groups;
CREATE POLICY "Group admins can update groups" 
ON public.groups 
FOR UPDATE 
USING (public.is_group_admin(auth.uid(), id));

-- Update the "Members can view their private groups" policy
DROP POLICY IF EXISTS "Members can view their private groups" ON public.groups;
CREATE POLICY "Members can view their private groups" 
ON public.groups 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_public = false 
  AND public.is_group_member(auth.uid(), id)
);
