-- Fix for infinite recursion in group_members policies
-- We introduce a SECURITY DEFINER function to bypass RLS when checking membership

-- Helper function to check if user is a member (bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is an admin (bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_group_admin_or_mod(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.group_members;

-- Recreate policies using the helper functions

-- 1. View Policy: Users can see members if they are in the group OR if the group is public?
-- The original policy only checked if they are a member.
-- We should also probably allow seeing members if the group is public, but let's stick to original intent for now + fix.
-- Original: Members can view group members
CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- User can see their own membership
    auth.uid() = user_id
    OR
    -- User can see other members if they are a member of the group
    is_group_member(group_id)
  )
);

-- 2. Insert Policy: Admins can add members
CREATE POLICY "Admins can add members"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND is_group_admin(group_id)
);

-- 3. Update Policy: Admins/Mods can update roles
CREATE POLICY "Admins can update members"
ON public.group_members
FOR UPDATE
USING (
  is_group_admin_or_mod(group_id)
);

-- 4. Delete Policy: Admins can remove members
CREATE POLICY "Admins can remove members"
ON public.group_members
FOR DELETE
USING (
  is_group_admin(group_id)
  AND user_id != auth.uid() -- Prevent removing self (optional, but good practice if 'Users can leave groups' handles self-removal)
);
