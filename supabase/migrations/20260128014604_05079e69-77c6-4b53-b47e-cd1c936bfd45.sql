
-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;

-- Create a policy that allows the group creator to add themselves as first member
CREATE POLICY "Group creator can add themselves as admin" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_members.group_id 
    AND created_by = auth.uid()
  )
);

-- Recreate the admin policy with correct syntax
CREATE POLICY "Admins can add other members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
);
