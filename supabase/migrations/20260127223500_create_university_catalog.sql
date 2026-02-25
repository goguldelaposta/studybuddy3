-- Create University Catalog Tables & Seed Data for Bucharest

-- 1. Universities Table
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Faculties Table
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(university_id, slug)
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 1,
  semester INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Universities are viewable by everyone" ON public.universities FOR SELECT USING (true);
CREATE POLICY "Faculties are viewable by everyone" ON public.faculties FOR SELECT USING (true);
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);

-- Admin policies (placeholder for now, false default for write)
CREATE POLICY "Admins can manage universities" ON public.universities FOR ALL USING (false);

-- 6. Link Groups to Courses
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id);

CREATE INDEX IF NOT EXISTS idx_groups_course ON public.groups(course_id);

-- 7. SEED DATA - BUCHAREST UNIVERSITIES
DO $$
DECLARE
  v_uni_id UUID;
  v_fac_id UUID;
BEGIN
  -- =================================================================================
  -- 1. UNIVERSITATEA DIN BUCUREȘTI (UB)
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'ub') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('Universitatea din București', 'UB', 'ub', 'București')
    RETURNING id INTO v_uni_id;

    -- FMI
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Matematică și Informatică', 'fmi') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Algebră', 1), (v_fac_id, 'Analiză Matematică', 1), (v_fac_id, 'Programare Procedurală', 1), (v_fac_id, 'Structuri de Date', 1), (v_fac_id, 'Baze de Date', 2), (v_fac_id, 'Inteligență Artificială', 3);

    -- Drept
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Drept', 'drept') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Drept Roman', 1), (v_fac_id, 'Drept Constituțional', 1), (v_fac_id, 'Drept Civil', 2), (v_fac_id, 'Drept Penal', 2);

    -- Litere
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Litere', 'litere') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Literatură Română', 1), (v_fac_id, 'Lingvistică Generală', 1);

    -- Limbi Straine
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Limbi și Literaturi Străine', 'lls') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Engleză Contemporană', 1), (v_fac_id, 'Civilizație Franceză', 1);

    -- Istorie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Istorie', 'istorie') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Istoria Antică', 1), (v_fac_id, 'Istoria Medievală', 2);

    -- Filosofie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Filosofie', 'filosofie') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Logică', 1), (v_fac_id, 'Istoria Filosofiei', 1);
    
    -- Jurnalism (FJSC)
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Jurnalism și Științele Comunicării', 'fjsc') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Teoria Comunicării', 1), (v_fac_id, 'Tehnici de Redactare', 1);
    
    -- Psihologie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Psihologie și Științele Educației', 'fpse') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Psihologie Generală', 1), (v_fac_id, 'Psihologia Dezvoltării', 1);
    
    -- Sociologie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Sociologie și Asistență Socială', 'sas') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Introducere în Sociologie', 1), (v_fac_id, 'Metode de Cercetare', 1);

    -- Biologie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Biologie', 'bio') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Biologie Celulară', 1), (v_fac_id, 'Genetică', 2);
    
    -- Fizica
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Fizică', 'fizica') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Mecanică', 1), (v_fac_id, 'Termodinamică', 1);
    
    -- Geografie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Geografie', 'geo') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Geografie Fizică', 1), (v_fac_id, 'Cartografie', 1);

  END IF;

  -- =================================================================================
  -- 2. POLITEHNICA BUCUREȘTI (UPB / UNSTPB)
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'upb') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('Politehnica București', 'UPB', 'upb', 'București')
    RETURNING id INTO v_uni_id;

    -- Automatica
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Automatică și Calculatoare', 'acs') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Matematică', 1), (v_fac_id, 'Fizică', 1), (v_fac_id, 'Programarea Calculatoarelor', 1), (v_fac_id, 'Proiectare Logică', 1), (v_fac_id, 'Structuri de Date', 2), (v_fac_id, 'Sisteme de Operare', 3);

    -- ETTI
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Electronică, Telecomunicații și Tehnologia Informației', 'etti') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Dispozitive Electronice', 1), (v_fac_id, 'Semnale și Sisteme', 2), (v_fac_id, 'Circuite Integrate', 3);

    -- Energetica
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Energetică', 'energ') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Bazele Electroenergeticii', 1), (v_fac_id, 'Centrale Electrice', 3);
    
    -- Inginerie Electrica
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Inginerie Electrică', 'ie') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Circuite Electrice', 1), (v_fac_id, 'Mașini Electrice', 2);
    
    -- Transporturi
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Transporturi', 'trans') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Mecanica Transporturilor', 1), (v_fac_id, 'Logistica Transporturilor', 3);
    
    -- Inginerie Aerospatiala
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Inginerie Aerospațială', 'ia') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Aerodinamică', 2), (v_fac_id, 'Mecanica Zborului', 3);
    
    -- Inginerie Medicala
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Inginerie Medicală', 'fim') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Biomateriale', 1), (v_fac_id, 'Imagistică Medicală', 3);
  END IF;

  -- =================================================================================
  -- 3. ACADEMIA DE STUDII ECONOMICE (ASE)
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'ase') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('Academia de Studii Economice', 'ASE', 'ase', 'București')
    RETURNING id INTO v_uni_id;

    -- CSIE
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Cibernetică, Statistică și Informatică Economică', 'csie') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Microeconomie', 1), (v_fac_id, 'Baze de Date', 1), (v_fac_id, 'Structuri de Date', 2), (v_fac_id, 'Statistică', 2);

    -- Management
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Management', 'man') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Bazele Managementului', 1), (v_fac_id, 'Managementul Proiectelor', 2);

    -- Marketing
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Marketing', 'mk') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Bazele Marketingului', 1), (v_fac_id, 'Comportamentul Consumatorului', 2);
    
    -- Finante Banci (FABBV)
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Finanțe, Asigurări, Bănci și Burse de Valori', 'fabbv') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Monedă și Credit', 1), (v_fac_id, 'Finanțe Publice', 2);
    
    -- REI
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Relații Economice Internaționale', 'rei') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Economie Mondială', 1), (v_fac_id, 'Afaceri Internaționale', 2);
  END IF;

  -- =================================================================================
  -- 4. UMF CAROL DAVILA
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'umfcd') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('UMF Carol Davila', 'UMFCD', 'umfcd', 'București')
    RETURNING id INTO v_uni_id;

    -- Medicina Generala
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Medicină', 'med') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Anatomie', 1), (v_fac_id, 'Biochimie', 1), (v_fac_id, 'Fiziologie', 2), (v_fac_id, 'Semiologie', 3);

    -- Stomatologie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Stomatologie', 'stoma') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Anatomie Dentară', 1), (v_fac_id, 'Materiale Dentare', 2);

    -- Farmacie
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Farmacie', 'farm') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Chimie Generală', 1), (v_fac_id, 'Farmacologie', 3);
  END IF;
  
  -- =================================================================================
  -- 5. SNSPA
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'snspa') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('SNSPA', 'SNSPA', 'snspa', 'București')
    RETURNING id INTO v_uni_id;

    -- Administratie Publica
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Administrație Publică', 'ap') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Știința Administrației', 1), (v_fac_id, 'Drept Administrativ', 1);

    -- Stiinte Politice
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Științe Politice', 'sp') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Introducere în Științe Politice', 1), (v_fac_id, 'Ideologii Politice', 2);
    
    -- Comunicare si Relatii Publice
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Comunicare și Relații Publice', 'fcrp') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Teoria Comunicării', 1), (v_fac_id, 'Relații Publice și Publicitate', 2);
  END IF;

  -- =================================================================================
  -- 6. UTCB (Constructii)
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'utcb') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('Universitatea Tehnică de Construcții', 'UTCB', 'utcb', 'București')
    RETURNING id INTO v_uni_id;

    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Construcții Civile, Industriale și Agricole', 'fccia') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Rezistența Materialelor', 1), (v_fac_id, 'Mecanica Construcțiilor', 2);
    
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Instalații', 'inst') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Termotehnică', 1), (v_fac_id, 'Instalații Sanitare', 2);
  END IF;
  
  -- =================================================================================
  -- 7. USAMV (Agronomie)
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'usamv') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('USAMV București', 'USAMV', 'usamv', 'București')
    RETURNING id INTO v_uni_id;

    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Agricultură', 'agriculture') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Botanică', 1), (v_fac_id, 'Pedologie', 2);
    
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Medicină Veterinară', 'vet') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Anatomie Comparată', 1), (v_fac_id, 'Fiziologie Animală', 2);
  END IF;

  -- =================================================================================
  -- 8. UNATC
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'unatc') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('UNATC I.L. Caragiale', 'UNATC', 'unatc', 'București')
    RETURNING id INTO v_uni_id;

    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Teatru', 'teatru') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Arta Actorului', 1), (v_fac_id, 'Istoria Teatrului', 1);
    
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Film', 'film') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Regie de Film', 1), (v_fac_id, 'Imagine de Film', 1);
  END IF;
  
  -- =================================================================================
  -- 9. UNARTE
  -- =================================================================================
  IF NOT EXISTS (SELECT 1 FROM public.universities WHERE slug = 'unarte') THEN
    INSERT INTO public.universities (name, short_name, slug, city)
    VALUES ('Universitatea Națională de Arte', 'UNARTE', 'unarte', 'București')
    RETURNING id INTO v_uni_id;

    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Arte Plastice', 'aplastice') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Pictură', 1), (v_fac_id, 'Sculptură', 1), (v_fac_id, 'Grafică', 1);
    
    INSERT INTO public.faculties (university_id, name, slug) VALUES (v_uni_id, 'Arte Decorative și Design', 'design') RETURNING id INTO v_fac_id;
    INSERT INTO public.courses (faculty_id, name, year) VALUES (v_fac_id, 'Design Grafic', 1), (v_fac_id, 'Modă', 1);
  END IF;

END $$;
