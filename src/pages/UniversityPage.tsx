import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useUniversityBySlug } from '@/hooks/useUniversityCatalog';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, GraduationCap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function UniversityPage() {
  const { uniSlug } = useParams<{ uniSlug: string }>();
  const { university, faculties, loading } = useUniversityBySlug(uniSlug);
  const { signOut, user } = useAuth();

  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        <main className="container mx-auto px-4 py-16 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Universitate negăsită</h1>
          <p className="text-muted-foreground mb-4">
            Universitatea căutată nu există în baza noastră de date.
          </p>
          <Link to="/uni" className="text-primary hover:underline">
            Vezi toate universitățile
          </Link>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{university.name} - Notițe și Cursuri | StudyBuddy</title>
        <meta 
          name="description" 
          content={`Găsește notițe, cursuri și materiale de studiu pentru ${university.name} (${university.short_name}). Descoperă resurse pentru ${faculties.length} facultăți.`} 
        />
        <meta property="og:title" content={`${university.name} - StudyBuddy`} />
        <meta property="og:description" content={`Notițe și materiale de studiu pentru studenții de la ${university.short_name}`} />
        <link rel="canonical" href={`https://www.studybuddy.ro/uni/${university.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Acasă</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/uni" className="hover:text-foreground">Universități</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{university.short_name}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start gap-4">
              {university.logo_url ? (
                <img 
                  src={university.logo_url} 
                  alt={`Logo ${university.short_name}`}
                  className="h-16 w-16 object-contain rounded-lg bg-muted p-2"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{university.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{university.city}</span>
                  <Badge variant="secondary" className="ml-2">
                    {university.short_name}
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Faculties Grid */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Facultăți ({faculties.length})
            </h2>
            
            {faculties.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nicio facultate adăugată încă pentru această universitate.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {faculties.map((faculty) => (
                  <Link 
                    key={faculty.id} 
                    to={`/uni/${university.slug}/${faculty.slug}`}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {faculty.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {faculty.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {faculty.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-3 text-sm text-primary">
                          <span>Vezi cursuri</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
