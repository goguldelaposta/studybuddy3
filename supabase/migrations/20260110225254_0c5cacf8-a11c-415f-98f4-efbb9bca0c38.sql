-- Step 1: Create universities table
CREATE TABLE public.universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'București',
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are viewable by everyone" 
ON public.universities FOR SELECT USING (true);

-- Step 2: Seed Bucharest universities
INSERT INTO public.universities (name, short_name, website) VALUES 
  ('Universitatea din București', 'UB', 'https://unibuc.ro'),
  ('Universitatea Politehnica din București', 'UPB', 'https://upb.ro'),
  ('Academia de Studii Economice din București', 'ASE', 'https://ase.ro'),
  ('Universitatea de Medicină și Farmacie Carol Davila', 'UMFCD', 'https://umfcd.ro'),
  ('Universitatea de Arhitectură și Urbanism Ion Mincu', 'UAUIM', 'https://uauim.ro'),
  ('Școala Națională de Studii Politice și Administrative', 'SNSPA', 'https://snspa.ro'),
  ('Universitatea Tehnică de Construcții București', 'UTCB', 'https://utcb.ro'),
  ('Universitatea de Științe Agronomice și Medicină Veterinară', 'USAMV', 'https://usamv.ro'),
  ('Universitatea Națională de Arte din București', 'UNA', 'https://unarte.org'),
  ('Universitatea Națională de Muzică București', 'UNMB', 'https://unmb.ro'),
  ('Academia de Poliție Alexandru Ioan Cuza', 'APAIC', 'https://academiadepolitie.ro'),
  ('Universitatea Titu Maiorescu', 'UTM', 'https://utm.ro'),
  ('Universitatea Spiru Haret', 'USH', 'https://spiruharet.ro'),
  ('Universitatea Hyperion', 'UH', 'https://hyperion.ro'),
  ('Universitatea Romano-Americană', 'URA', 'https://urar.ro');

-- Step 3: Add university_id to profiles
ALTER TABLE public.profiles ADD COLUMN university_id UUID REFERENCES public.universities(id);

-- Step 4: Add university_id to subjects
ALTER TABLE public.subjects ADD COLUMN university_id UUID REFERENCES public.universities(id);

-- Step 5: Clear old seed data and add new skills
DELETE FROM public.profile_skills;
DELETE FROM public.profile_subjects;
DELETE FROM public.skills;
DELETE FROM public.subjects;

-- Step 6: Seed updated skills
INSERT INTO public.skills (name, category) VALUES 
  ('Python', 'programming'),
  ('JavaScript', 'programming'),
  ('Java', 'programming'),
  ('C/C++', 'programming'),
  ('React', 'frontend'),
  ('Node.js', 'backend'),
  ('SQL', 'database'),
  ('Machine Learning', 'ai'),
  ('Data Science', 'data'),
  ('AutoCAD', 'design'),
  ('MATLAB', 'engineering'),
  ('Excel Avansat', 'business'),
  ('Contabilitate', 'business'),
  ('Marketing Digital', 'business'),
  ('Cercetare Academică', 'academic'),
  ('Redactare Științifică', 'academic'),
  ('Prezentări', 'soft-skill'),
  ('Leadership', 'soft-skill'),
  ('Management Proiecte', 'soft-skill'),
  ('Limba Engleză', 'language'),
  ('Limba Germană', 'language'),
  ('Limba Franceză', 'language'),
  ('Photoshop', 'design'),
  ('Figma', 'design'),
  ('Arduino', 'engineering'),
  ('SPSS', 'data'),
  ('LaTeX', 'academic');