-- Add slug and logo_url columns to universities table
ALTER TABLE public.universities 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_universities_slug ON public.universities(slug);

-- Create faculties table
CREATE TABLE IF NOT EXISTS public.faculties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(university_id, slug)
);

-- Create index for faculty lookups
CREATE INDEX IF NOT EXISTS idx_faculties_slug ON public.faculties(slug);
CREATE INDEX IF NOT EXISTS idx_faculties_university ON public.faculties(university_id);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id uuid REFERENCES public.faculties(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  year integer NOT NULL CHECK (year >= 1 AND year <= 6),
  semester integer CHECK (semester >= 1 AND semester <= 2),
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for courses
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_year ON public.courses(year);

-- Enable RLS
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faculties (public read)
CREATE POLICY "Faculties are viewable by everyone" 
ON public.faculties FOR SELECT 
USING (true);

-- RLS Policies for courses (public read)
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses FOR SELECT 
USING (true);

-- Admin policies for faculties
CREATE POLICY "Admins can insert faculties" 
ON public.faculties FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update faculties" 
ON public.faculties FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete faculties" 
ON public.faculties FOR DELETE 
USING (is_admin(auth.uid()));

-- Admin policies for courses
CREATE POLICY "Admins can insert courses" 
ON public.courses FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update courses" 
ON public.courses FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete courses" 
ON public.courses FOR DELETE 
USING (is_admin(auth.uid()));