-- Add course_id to groups table to link with University Catalog
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_groups_course ON public.groups(course_id);

-- Optional: Add faculty_id if we want to filter groups by faculty directly too?
-- For now, course_id implies faculty/university, but explicit column might help filtering.
-- Let's stick to course_id as per plan.

-- Update RLS policies?
-- Existing policies on 'groups' should continue to work fine (created_by, is_public).
