
-- Adăugare biblioteci și cafenele populare din București
INSERT INTO public.study_locations (name, description, type, address, city, latitude, longitude, price_range, amenities, opening_hours, website, rating, reviews_count, is_verified) VALUES
-- Biblioteci
('Biblioteca Centrală Universitară Carol I', 'Bibliotecă academică emblematică cu arhitectură impresionantă și săli de lectură spațioase.', 'library', 'Bulevardul Regina Elisabeta 4-12', 'București', 44.4358, 26.0987, 'free', ARRAY['wifi', 'liniste', 'carti', 'aer_conditionat'], 'Luni-Vineri: 08:00-20:00, Sâmbătă: 09:00-14:00', 'https://www.bcub.ro', 4.6, 89, true),
('Biblioteca Metropolitană București - Filiala Mihail Sadoveanu', 'Filială modernă cu secțiune pentru tineret și spații de studiu confortabile.', 'library', 'Strada Lipscani 71', 'București', 44.4319, 26.0988, 'free', ARRAY['wifi', 'liniste', 'carti', 'aer_conditionat'], 'Luni-Vineri: 09:00-19:00', 'https://www.bibliotecametropolitana.ro', 4.4, 45, true),
('Biblioteca Academiei Române', 'Bibliotecă de prestigiu cu colecții rare și săli de cercetare.', 'library', 'Calea Victoriei 125', 'București', 44.4479, 26.0856, 'free', ARRAY['wifi', 'liniste', 'carti'], 'Luni-Vineri: 09:00-19:00', 'https://www.biblacad.ro', 4.7, 67, true),
('Biblioteca UAUIM', 'Biblioteca Universității de Arhitectură, cu spații moderne de studiu.', 'library', 'Strada Academiei 18-20', 'București', 44.4381, 26.0997, 'free', ARRAY['wifi', 'liniste', 'carti', 'prize'], 'Luni-Vineri: 08:00-20:00', NULL, 4.3, 28, true),

-- Cafenele pentru studiu
('Origo Coffee Shop', 'Cafenea specialty cu atmosferă liniștită, perfectă pentru studiu și lucru remote.', 'cafe', 'Strada Lipscani 9', 'București', 44.4313, 26.1005, 'moderate', ARRAY['wifi', 'prize', 'cafea'], 'Zilnic: 08:00-22:00', 'https://origocoffee.ro', 4.8, 156, true),
('M60', 'Spațiu creativ cu cafenea, ideal pentru studenți și freelanceri.', 'cafe', 'Strada Mendeleev 28-30', 'București', 44.4466, 26.0927, 'moderate', ARRAY['wifi', 'prize', 'cafea', 'aer_conditionat'], 'Luni-Vineri: 09:00-22:00, Weekend: 10:00-22:00', NULL, 4.5, 89, true),
('Beans & Dots', 'Cafenea cozy cu locuri de muncă și atmosferă prietenoasă.', 'cafe', 'Strada Delea Veche 24', 'București', 44.4378, 26.1156, 'budget', ARRAY['wifi', 'prize', 'cafea'], 'Zilnic: 08:00-21:00', NULL, 4.6, 72, true),
('The Coffee Factory', 'Rețea de cafenele cu spații ample și atmosferă relaxată pentru studiu.', 'cafe', 'Strada Edgar Quinet 9', 'București', 44.4357, 26.0952, 'moderate', ARRAY['wifi', 'prize', 'cafea', 'aer_conditionat'], 'Zilnic: 07:30-22:00', 'https://thecoffeefactory.ro', 4.4, 134, true),
('Steam Coffee', 'Cafenea artizanală cu prăjitorie proprie și atmosferă hipster.', 'cafe', 'Strada Visarion 9', 'București', 44.4480, 26.0886, 'moderate', ARRAY['wifi', 'prize', 'cafea'], 'Luni-Vineri: 08:00-20:00, Weekend: 09:00-20:00', NULL, 4.7, 98, true),
('Tucano Coffee', 'Cafenea cu mese spațioase și prize la fiecare loc, ideală pentru lucru.', 'cafe', 'Bulevardul Unirii 27', 'București', 44.4265, 26.1086, 'budget', ARRAY['wifi', 'prize', 'cafea', 'aer_conditionat'], 'Zilnic: 07:00-22:00', 'https://tucanocoffee.com', 4.3, 167, true),

-- Coworking spaces
('Impact Hub București', 'Spațiu de coworking cu comunitate activă și evenimente frecvente.', 'coworking', 'Strada Splaiul Independenței 319', 'București', 44.4296, 26.0674, 'expensive', ARRAY['wifi', 'prize', 'cafea', 'aer_conditionat', 'imprimanta', 'grup'], 'Luni-Vineri: 09:00-21:00', 'https://impacthub.ro', 4.6, 78, true),
('TechHub București', 'Hub tehnologic cu facilități moderne pentru startup-uri și studenți.', 'coworking', 'Piața Victoriei 2', 'București', 44.4529, 26.0849, 'expensive', ARRAY['wifi', 'prize', 'cafea', 'aer_conditionat', 'imprimanta'], 'Luni-Vineri: 08:00-22:00', NULL, 4.5, 56, true),

-- Librării cu cafenea
('Cărturești Verona', 'Librărie elegantă cu cafenea, ambianță perfectă pentru lectură și studiu.', 'bookstore', 'Strada Arthur Verona 13-15', 'București', 44.4448, 26.0930, 'moderate', ARRAY['wifi', 'cafea', 'carti', 'liniste'], 'Zilnic: 10:00-22:00', 'https://carturesti.ro', 4.7, 203, true),
('Humanitas Kretzulescu', 'Librărie istorică în centrul Bucureștiului cu atmosferă culturală.', 'bookstore', 'Calea Victoriei 45', 'București', 44.4408, 26.0908, 'moderate', ARRAY['wifi', 'carti', 'liniste'], 'Luni-Sâmbătă: 10:00-20:00, Duminică: 11:00-18:00', 'https://humanitas.ro', 4.5, 89, true);
