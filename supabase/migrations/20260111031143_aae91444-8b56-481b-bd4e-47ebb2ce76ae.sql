-- Create reports table for user reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,
    reported_user_id UUID,
    reported_content_type TEXT NOT NULL, -- 'user', 'announcement', 'group', 'message'
    reported_content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_suspensions table
CREATE TABLE public.user_suspensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    suspended_by UUID NOT NULL,
    reason TEXT NOT NULL,
    suspended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    suspended_until TIMESTAMP WITH TIME ZONE, -- NULL means permanent
    is_active BOOLEAN NOT NULL DEFAULT true,
    lifted_by UUID,
    lifted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add moderation status to announcements
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderated_by UUID,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Add moderation status to groups
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderated_by UUID,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;

-- Reports RLS policies
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
ON public.reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "Admins and moderators can view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Admins and moderators can update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
);

-- User suspensions RLS policies
CREATE POLICY "Admins can manage suspensions"
ON public.user_suspensions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view suspensions"
ON public.user_suspensions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can create suspensions"
ON public.user_suspensions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'moderator'));

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_suspensions
    WHERE user_id = _user_id
      AND is_active = true
      AND (suspended_until IS NULL OR suspended_until > now())
  )
$$;

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;