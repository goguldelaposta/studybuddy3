-- Create announcements table for student ads/classifieds
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tutoring', 'books', 'roommate', 'events', 'jobs', 'other')),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'RON',
  contact_info TEXT,
  university_id UUID REFERENCES public.universities(id),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone authenticated can view active announcements
CREATE POLICY "Authenticated users can view active announcements"
ON public.announcements
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Users can view their own announcements (including inactive)
CREATE POLICY "Users can view their own announcements"
ON public.announcements
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own announcements
CREATE POLICY "Users can create announcements"
ON public.announcements
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can update their own announcements
CREATE POLICY "Users can update their own announcements"
ON public.announcements
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own announcements
CREATE POLICY "Users can delete their own announcements"
ON public.announcements
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_announcements_user ON public.announcements(user_id);
CREATE INDEX idx_announcements_category ON public.announcements(category);
CREATE INDEX idx_announcements_university ON public.announcements(university_id);
CREATE INDEX idx_announcements_active ON public.announcements(is_active) WHERE is_active = true;
CREATE INDEX idx_announcements_created ON public.announcements(created_at DESC);