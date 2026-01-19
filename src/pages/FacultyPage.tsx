import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFacultyBySlug } from '@/hooks/useUniversityCatalog';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  ChevronRight, 
  BookOpen, 
  Upload, 
  FileText,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function FacultyPage() {
  const { uniSlug, facultySlug } = useParams<{ uniSlug: string; facultySlug: string }>();
  const { faculty, courses, notesCount, loading } = useFacultyBySlug(uniSlug, facultySlug);
  const { signOut, user } = useAuth();

  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        <main className="container mx-auto px-4 py-16 text-center">
          <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Facultate negăsită</h1>
          <p className="text-muted-foreground mb-4">
            Facultatea căutată nu există în baza noastră de date.
          </p>
          <Link to="/uni" className="text-primary hover:underline">
            Vezi toate universitățile
          </Link>
        </main>
      </div>
    );
  }

  // Group courses by year
  const coursesByYear = courses.reduce((acc, course) => {
    if (!acc[course.year]) {
      acc[course.year] = [];
    }
    acc[course.year].push(course);
    return acc;
  }, {} as Record<number, typeof courses>);

  const years = Object.keys(coursesByYear).map(Number).sort();

  return (
    <>
      <Helmet>
        <title>{faculty.name} - Notițe și Cursuri | StudyBuddy</title>
        <meta 
          name="description" 
          content={`Notițe, cursuri și materiale de studiu pentru ${faculty.name} la ${faculty.university.name}. ${notesCount > 0 ? `${notesCount} notițe disponibile.` : 'Fii primul care încarcă notițe!'}`} 
        />
        <meta property="og:title" content={`${faculty.name} - ${faculty.university.short_name} | StudyBuddy`} />
        <meta property="og:description" content={`Resurse de studiu pentru studenții de la ${faculty.name}`} />
        <link rel="canonical" href={`https://www.studybuddy.ro/uni/${uniSlug}/${facultySlug}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link to="/" className="hover:text-foreground">Acasă</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/uni" className="hover:text-foreground">Universități</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/uni/${uniSlug}`} className="hover:text-foreground">
              {faculty.university.short_name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{faculty.name}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <Link to={`/uni/${uniSlug}`} className="hover:text-foreground">
                {faculty.university.name}
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-3">{faculty.name}</h1>
            {faculty.description && (
              <p className="text-muted-foreground max-w-2xl">{faculty.description}</p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {notesCount} notițe
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {courses.length} cursuri
              </Badge>
            </div>
          </header>

          {/* Empty State - Be First to Upload */}
          {notesCount === 0 && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="py-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Fii primul care contribuie! 🎉
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Nu există încă notițe pentru {faculty.name}. 
                    Încarcă primele notițe și ajută colegii tăi de facultate!
                  </p>
                  {user ? (
                    <Link to="/notes">
                      <Button className="gap-2">
                        <Upload className="h-4 w-4" />
                        Încarcă notițe
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button className="gap-2">
                        <Upload className="h-4 w-4" />
                        Conectează-te pentru a încărca
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Available Banner */}
          {notesCount > 0 && (
            <Card className="mb-8 border-green-500/20 bg-green-500/5">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {notesCount} notițe disponibile
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Materiale încărcate de colegi pentru {faculty.name}
                      </p>
                    </div>
                  </div>
                  <Link to={`/notes?faculty=${encodeURIComponent(faculty.name)}`}>
                    <Button variant="outline" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Vezi notițele
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses by Year */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cursuri pe ani de studiu
            </h2>

            {years.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Cursuri în curs de adăugare</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Lista de cursuri pentru această facultate va fi disponibilă în curând.
                    Poți totuși să încarci notițe pentru orice materie!
                  </p>
                  {user && (
                    <Link to="/notes" className="inline-block mt-4">
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Încarcă notițe
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {years.map((year) => (
                  <div key={year}>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Badge variant="outline">Anul {year}</Badge>
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {coursesByYear[year].map((course) => (
                        <Card key={course.id} className="hover:shadow-sm transition-shadow">
                          <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base font-medium">
                              {course.name}
                            </CardTitle>
                            {course.semester && (
                              <p className="text-xs text-muted-foreground">
                                Semestrul {course.semester}
                              </p>
                            )}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="mt-12 text-center py-8 border-t">
            <h2 className="text-lg font-semibold mb-2">
              Ai notițe pentru {faculty.name}?
            </h2>
            <p className="text-muted-foreground mb-4">
              Ajută-ți colegii încărcând materialele tale de studiu.
            </p>
            {user ? (
              <Link to="/notes">
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Încarcă notițe
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="gap-2">
                  Conectează-te
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
