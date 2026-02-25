-- Fix for 'Chicken and Egg' problem in Group Creation
-- Allows creators to view their groups and add themselves as admins

-- 1. Helper function to check if user is the creator (bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = _group_id
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow creators to view their own groups (even if private and not yet a member)
CREATE POLICY "Creators can view their own groups"
ON public.groups
FOR SELECT
USING (auth.uid() = created_by);

-- 3. Allow creators to add THEMSELVES as the first member/admin
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;

CREATE POLICY "Admins can add members"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- Standard: Existing admin adds someone
    is_group_admin(group_id)
    OR
    -- Exception: Creator adds themselves
    (
      auth.uid() = user_id
      AND is_group_creator(group_id)
    )
  )
);

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_group_creator TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin_or_mod TO authenticated;
