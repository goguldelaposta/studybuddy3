-- Create table for study locations
CREATE TABLE public.study_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('cafe', 'library', 'bookstore', 'coworking', 'university', 'other')),
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'București',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  price_range TEXT CHECK (price_range IN ('free', 'budget', 'moderate', 'expensive')),
  amenities TEXT[] DEFAULT '{}',
  opening_hours TEXT,
  website TEXT,
  image_url TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  added_by UUID,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_locations ENABLE ROW LEVEL SECURITY;

-- Everyone can view locations
CREATE POLICY "Anyone can view study locations"
ON public.study_locations
FOR SELECT
USING (true);

-- Authenticated users can add locations
CREATE POLICY "Authenticated users can add locations"
ON public.study_locations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = added_by);

-- Users can update their own unverified locations
CREATE POLICY "Users can update own unverified locations"
ON public.study_locations
FOR UPDATE
TO authenticated
USING (auth.uid() = added_by AND is_verified = false);

-- Add trigger for updated_at
CREATE TRIGGER update_study_locations_updated_at
BEFORE UPDATE ON public.study_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial study locations in Bucharest
INSERT INTO public.study_locations (name, description, type, address, city, latitude, longitude, price_range, amenities, opening_hours) VALUES
('Biblioteca Centrală Universitară', 'Cea mai mare bibliotecă universitară din România, cu săli de lectură spațioase și acces la milioane de cărți.', 'library', 'Strada Boteanu 1', 'București', 44.4379, 26.1003, 'free', ARRAY['wifi', 'prize', 'aer_conditionat', 'liniste'], 'Luni-Vineri: 08:00-20:00, Sâmbătă: 09:00-14:00'),
('Biblioteca Națională a României', 'Bibliotecă modernă cu spații de studiu individuale și de grup.', 'library', 'Bulevardul Unirii 22', 'București', 44.4215, 26.1052, 'free', ARRAY['wifi', 'prize', 'aer_conditionat', 'liniste', 'grup'], 'Luni-Vineri: 09:00-19:00'),
('Origo Coffee Shop', 'Cafenea specialty cu atmosferă perfectă pentru studiu și mese spațioase.', 'cafe', 'Strada Lipscani 9', 'București', 44.4312, 26.0996, 'moderate', ARRAY['wifi', 'prize', 'cafea'], 'Zilnic: 08:00-22:00'),
('Cărturești Carusel', 'Librărie emblematică cu spațiu de lectură și cafenea la etaj.', 'bookstore', 'Strada Lipscani 55', 'București', 44.4307, 26.0971, 'budget', ARRAY['wifi', 'cafea', 'carti'], 'Zilnic: 10:00-22:00'),
('The Institute', 'Coworking space cu abonamente flexibile, ideal pentru studenți.', 'coworking', 'Strada Occidentului 5', 'București', 44.4519, 26.0765, 'moderate', ARRAY['wifi', 'prize', 'cafea', 'aer_conditionat', 'imprimanta'], 'Luni-Vineri: 08:00-22:00'),
('M60', 'Cafenea creativă populară printre studenți, cu spațiu generos.', 'cafe', 'Strada Mendeleev 28-30', 'București', 44.4476, 26.0962, 'budget', ARRAY['wifi', 'prize', 'cafea'], 'Zilnic: 09:00-23:00'),
('Bibliotecii ASE', 'Biblioteca Academiei de Studii Economice cu acces pentru studenți.', 'library', 'Piața Romană 6', 'București', 44.4469, 26.0977, 'free', ARRAY['wifi', 'prize', 'liniste', 'aer_conditionat'], 'Luni-Vineri: 08:00-20:00'),
('Seneca Anticafe', 'Anticafe unde plătești pe oră, nu pe consum. Perfect pentru sesiune.', 'cafe', 'Strada Academiei 29', 'București', 44.4402, 26.1009, 'budget', ARRAY['wifi', 'prize', 'cafea', 'jocuri', 'grup'], 'Zilnic: 10:00-00:00');