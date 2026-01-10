-- Seed subjects for each university
-- UPB - Politehnica
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Programare Orientată pe Obiecte', 'POO', 'Automatică și Calculatoare'),
  ('Structuri de Date', 'SD', 'Automatică și Calculatoare'),
  ('Baze de Date', 'BD', 'Automatică și Calculatoare'),
  ('Rețele de Calculatoare', 'RC', 'Automatică și Calculatoare'),
  ('Inteligență Artificială', 'IA', 'Automatică și Calculatoare'),
  ('Electronică Digitală', 'ED', 'Electronică'),
  ('Sisteme cu Microprocesoare', 'SM', 'Electronică'),
  ('Rezistența Materialelor', 'RM', 'Inginerie Mecanică'),
  ('Termotehnică', 'TT', 'Energetică')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'UPB';

-- ASE
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Microeconomie', 'MIC', 'Economie'),
  ('Macroeconomie', 'MAC', 'Economie'),
  ('Contabilitate Financiară', 'CF', 'Contabilitate'),
  ('Marketing', 'MKT', 'Marketing'),
  ('Management', 'MGM', 'Management'),
  ('Informatică Economică', 'IE', 'Cibernetică'),
  ('Statistică', 'STAT', 'Cibernetică'),
  ('Finanțe Corporative', 'FC', 'Finanțe'),
  ('Relații Economice Internaționale', 'REI', 'REI')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'ASE';

-- UB - Universitatea din București
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Drept Civil', 'DC', 'Drept'),
  ('Drept Penal', 'DP', 'Drept'),
  ('Psihologie Generală', 'PG', 'Psihologie'),
  ('Psihologie Clinică', 'PC', 'Psihologie'),
  ('Istorie Contemporană', 'IC', 'Istorie'),
  ('Literatură Română', 'LR', 'Litere'),
  ('Jurnalism', 'JRN', 'Jurnalism'),
  ('Filosofie', 'FIL', 'Filosofie'),
  ('Sociologie', 'SOC', 'Sociologie'),
  ('Matematică', 'MAT', 'Matematică-Informatică'),
  ('Informatică', 'INF', 'Matematică-Informatică')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'UB';

-- UMFCD
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Anatomie', 'ANAT', 'Medicină'),
  ('Fiziologie', 'FIZ', 'Medicină'),
  ('Biochimie', 'BCH', 'Medicină'),
  ('Farmacologie', 'FARM', 'Farmacie'),
  ('Chirurgie', 'CHR', 'Medicină'),
  ('Medicină Internă', 'MI', 'Medicină'),
  ('Stomatologie', 'STO', 'Medicină Dentară')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'UMFCD';

-- SNSPA
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Științe Politice', 'SP', 'Științe Politice'),
  ('Relații Internaționale', 'RI', 'Relații Internaționale'),
  ('Administrație Publică', 'AP', 'Administrație'),
  ('Comunicare și Relații Publice', 'CRP', 'Comunicare')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'SNSPA';

-- UAUIM
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Proiectare Arhitecturală', 'PA', 'Arhitectură'),
  ('Istoria Arhitecturii', 'IAR', 'Arhitectură'),
  ('Urbanism', 'URB', 'Urbanism'),
  ('Design Interior', 'DI', 'Design')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'UAUIM';

-- UTCB
INSERT INTO public.subjects (name, code, faculty, university_id) 
SELECT s.n, s.c, s.f, u.id FROM (VALUES 
  ('Mecanica Structurilor', 'MS', 'Construcții Civile'),
  ('Beton Armat', 'BA', 'Construcții Civile'),
  ('Geotehnică', 'GEO', 'Construcții Civile'),
  ('Hidraulică', 'HID', 'Hidrotehnică')
) AS s(n, c, f), public.universities u WHERE u.short_name = 'UTCB';