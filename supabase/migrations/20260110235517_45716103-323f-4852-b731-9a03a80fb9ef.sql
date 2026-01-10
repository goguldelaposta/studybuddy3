-- Create groups table for study groups
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  university_id UUID REFERENCES public.universities(id),
  created_by UUID NOT NULL,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table for membership
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups table

-- Anyone authenticated can view public groups
CREATE POLICY "Authenticated users can view public groups"
ON public.groups
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_public = true);

-- Members can view private groups they belong to
CREATE POLICY "Members can view their private groups"
ON public.groups
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND is_public = false 
  AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Only group admins can update groups
CREATE POLICY "Group admins can update groups"
ON public.groups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
  )
);

-- Only group admins can delete groups
CREATE POLICY "Group admins can delete groups"
ON public.groups
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
  )
);

-- RLS Policies for group_members table

-- Members can view other members in their groups
CREATE POLICY "Members can view group members"
ON public.group_members
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.group_members AS gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

-- Users can join public groups
CREATE POLICY "Users can join public groups"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_id 
    AND groups.is_public = true
  )
);

-- Group admins can add members to private groups
CREATE POLICY "Admins can add members"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.group_members AS gm 
    WHERE gm.group_id = group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
);

-- Admins and moderators can update member roles
CREATE POLICY "Admins can update members"
ON public.group_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members AS gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('admin', 'moderator')
  )
);

-- Users can leave groups (delete their own membership)
CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can remove members
CREATE POLICY "Admins can remove members"
ON public.group_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members AS gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
  AND user_id != auth.uid()
);

-- Create trigger for updating groups.updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_groups_university ON public.groups(university_id);
CREATE INDEX idx_groups_subject ON public.groups(subject_id);
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);

-- Enable realtime for group updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;