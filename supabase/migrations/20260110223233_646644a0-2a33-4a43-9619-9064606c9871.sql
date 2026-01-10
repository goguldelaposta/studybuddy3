-- Create profiles table for student information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  faculty TEXT NOT NULL,
  year_of_study INTEGER DEFAULT 1,
  bio TEXT,
  avatar_url TEXT,
  looking_for TEXT DEFAULT 'teammates',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general'
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  faculty TEXT NOT NULL
);

-- Create profile_skills junction table
CREATE TABLE public.profile_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills ON DELETE CASCADE,
  UNIQUE(profile_id, skill_id)
);

-- Create profile_subjects junction table
CREATE TABLE public.profile_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  UNIQUE(profile_id, subject_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_subjects ENABLE ROW LEVEL SECURITY;

-- Profiles policies: anyone can view, users can manage their own
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Skills policies: anyone can view (for selection), admins manage
CREATE POLICY "Skills are viewable by everyone" 
ON public.skills FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert skills" 
ON public.skills FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Subjects policies: anyone can view
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert subjects" 
ON public.subjects FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Profile skills policies
CREATE POLICY "Profile skills are viewable by everyone" 
ON public.profile_skills FOR SELECT USING (true);

CREATE POLICY "Users can manage their profile skills" 
ON public.profile_skills FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete their profile skills" 
ON public.profile_skills FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

-- Profile subjects policies
CREATE POLICY "Profile subjects are viewable by everyone" 
ON public.profile_subjects FOR SELECT USING (true);

CREATE POLICY "Users can manage their profile subjects" 
ON public.profile_subjects FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete their profile subjects" 
ON public.profile_subjects FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial skills
INSERT INTO public.skills (name, category) VALUES 
  ('JavaScript', 'programming'),
  ('Python', 'programming'),
  ('React', 'frontend'),
  ('Node.js', 'backend'),
  ('SQL', 'database'),
  ('TypeScript', 'programming'),
  ('Java', 'programming'),
  ('C++', 'programming'),
  ('Machine Learning', 'ai'),
  ('Data Analysis', 'data'),
  ('UI/UX Design', 'design'),
  ('Project Management', 'soft-skill'),
  ('Communication', 'soft-skill'),
  ('Leadership', 'soft-skill'),
  ('Research', 'academic'),
  ('Writing', 'academic'),
  ('Statistics', 'data'),
  ('Public Speaking', 'soft-skill');

-- Seed initial subjects
INSERT INTO public.subjects (name, code, faculty) VALUES 
  ('Introduction to Computer Science', 'CS101', 'Computer Science'),
  ('Data Structures', 'CS201', 'Computer Science'),
  ('Algorithms', 'CS301', 'Computer Science'),
  ('Web Development', 'CS250', 'Computer Science'),
  ('Database Systems', 'CS350', 'Computer Science'),
  ('Calculus I', 'MATH101', 'Mathematics'),
  ('Linear Algebra', 'MATH201', 'Mathematics'),
  ('Statistics', 'MATH301', 'Mathematics'),
  ('Organic Chemistry', 'CHEM201', 'Chemistry'),
  ('General Physics', 'PHYS101', 'Physics'),
  ('Business Ethics', 'BUS301', 'Business'),
  ('Marketing', 'BUS201', 'Business'),
  ('Microeconomics', 'ECON101', 'Economics'),
  ('Psychology 101', 'PSY101', 'Psychology'),
  ('English Literature', 'ENG201', 'English');