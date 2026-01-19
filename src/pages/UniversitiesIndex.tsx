import { Link } from 'react-router-dom';
import { useUniversityCatalog } from '@/hooks/useUniversityCatalog';
import { useSEO } from '@/hooks/useSEO';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, ChevronRight, Search, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useMemo } from 'react';

export default function UniversitiesIndex() {
  const { universities, loading } = useUniversityCatalog();
  const { signOut, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const isAuthenticated = !!user;

  useSEO({
    title: 'Universități din România - Notițe și Cursuri | StudyBuddy',
    description: 'Descoperă notițe și materiale de studiu pentru universitățile din România. Găsește resurse pentru facultățile tale preferate.',
    canonical: 'https://www.studybuddy.ro/uni'
  });

  const filteredUniversities = useMemo(() => {
    if (!searchTerm.trim()) return universities;
    const term = searchTerm.toLowerCase();
    return universities.filter(
      (uni) =>
        uni.name.toLowerCase().includes(term) ||
        uni.short_name.toLowerCase().includes(term) ||
        uni.city.toLowerCase().includes(term)
    );
  }, [universities, searchTerm]);

  // Group by city
  const universitiesByCity = useMemo(() => {
    return filteredUniversities.reduce((acc, uni) => {
      if (!acc[uni.city]) {
        acc[uni.city] = [];
      }
      acc[uni.city].push(uni);
      return acc;
    }, {} as Record<string, typeof universities>);
  }, [filteredUniversities]);

  const cities = Object.keys(universitiesByCity).sort();

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Acasă</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Universități</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Universități din România</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explorează catalogul nostru de universități și facultăți. 
            Găsește notițe și materiale de studiu pentru facultatea ta.
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Caută universități..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredUniversities.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nicio universitate găsită</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Încearcă alte cuvinte cheie pentru căutare.'
                  : 'Nu există universități în catalog momentan.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {cities.map((city) => (
              <section key={city}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {city}
                  <Badge variant="secondary">{universitiesByCity[city].length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {universitiesByCity[city].map((uni) => (
                    <Link key={uni.id} to={`/uni/${uni.slug}`}>
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            {uni.logo_url ? (
                              <img 
                                src={uni.logo_url} 
                                alt={`Logo ${uni.short_name}`}
                                className="h-10 w-10 object-contain rounded bg-muted p-1"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                                {uni.name}
                              </CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {uni.short_name}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Vezi facultățile
                            </span>
                            <ChevronRight className="h-4 w-4 text-primary" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
