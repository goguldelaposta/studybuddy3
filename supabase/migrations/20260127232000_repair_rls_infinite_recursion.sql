-- DEFINITIVE FIX FOR INFINITE RECURSION (42P17)
-- This script resets the policies on group_members and ensures functions are safe.

-- 1. Drop existing policies to clear the slate
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members; -- Potential old policy
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "view_members" ON public.group_members;

-- 2. Drop and Recreate Helper Functions as SECURITY DEFINER
-- SECURITY DEFINER is crucial: it allows the function to bypass RLS, breaking the recursion loop.

DROP FUNCTION IF EXISTS public.is_group_member(uuid);
DROP FUNCTION IF EXISTS public.is_group_admin(uuid);
DROP FUNCTION IF EXISTS public.is_group_creator(uuid);
DROP FUNCTION IF EXISTS public.is_group_admin_or_mod(uuid);

-- Function: Check if user is member (Safe)
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

-- Function: Check if user is admin (Safe)
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

-- Function: Check if user is admin or mod (Safe)
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

-- Function: Check if user is creator of the group (Safe for Chicken/Egg problem)
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

-- 3. Apply CORRECT Policies

-- View: Members can view other members + Creators can view members of their own groups (even if not joined yet)
CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_group_member(group_id) -- I am a member
    OR
    is_group_creator(group_id) -- I created the group
  )
);

-- Insert: Admins can add members + Creators can add THEMSELVES (Chicken & Egg) + Users can join public groups?
-- The app logic seems to use `joinGroup` (user adds self) vs `createGroup` (creator adds self).
-- Let's support both:
-- A) Admin adds someone else
-- B) Creator adds themselves
-- C) User joins a PUBLIC group (Self-insert where group is public)

CREATE POLICY "Manage group members"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    -- Case 1: Creator adding themselves (First member)
    (auth.uid() = user_id AND is_group_creator(group_id))
    OR
    -- Case 2: Admin adding someone
    is_group_admin(group_id)
    OR
    -- Case 3: Public Join (User adding THEMSELVES to a PUBLIC group)
    (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.groups 
            WHERE id = group_id AND is_public = true
        )
    )
  )
);

-- Update: Admins/Mods can update roles
CREATE POLICY "Admins can update members"
ON public.group_members
FOR UPDATE
USING (
  is_group_admin_or_mod(group_id)
);

-- Delete: Admins can remove members OR User can leave (remove themselves)
CREATE POLICY "Admins can remove members or user leave"
ON public.group_members
FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND (
    is_group_admin(group_id) -- Admin kicks
    OR 
    auth.uid() = user_id -- User leaves
  )
);

-- 4. Grants (Explicit UUID type to match signatures)
GRANT EXECUTE ON FUNCTION public.is_group_creator(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin_or_mod(UUID) TO authenticated;
