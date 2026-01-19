import { useParams, Link } from 'react-router-dom';
import { useCourseById } from '@/hooks/useUniversityCatalog';
import { useSEO } from '@/hooks/useSEO';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
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

export default function CoursePage() {
  const { uniSlug, facultySlug, courseId } = useParams<{ 
    uniSlug: string; 
    facultySlug: string; 
    courseId: string;
  }>();
  const { course, notesCount, loading } = useCourseById(courseId);
  const { signOut, user } = useAuth();

  const isAuthenticated = !!user;

  useSEO({
    title: course 
      ? `${course.name} - Notițe | StudyBuddy`
      : 'Curs | StudyBuddy',
    description: course 
      ? `Notițe și materiale de studiu pentru cursul ${course.name}. ${notesCount > 0 ? `${notesCount} notițe disponibile.` : 'Fii primul care încarcă notițe!'}`
      : 'Găsește notițe pentru cursuri din facultățile din România.',
    canonical: course 
      ? `https://www.studybuddy.ro/uni/${uniSlug}/${facultySlug}/${courseId}`
      : 'https://www.studybuddy.ro/uni'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={isAuthenticated} onSignOut={signOut} />
        <main className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Curs negăsit</h1>
          <p className="text-muted-foreground mb-4">
            Cursul căutat nu există în baza noastră de date.
          </p>
          <Link to="/uni" className="text-primary hover:underline">
            Vezi toate universitățile
          </Link>
        </main>
      </div>
    );
  }

  return (
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
            {course.faculty?.university?.short_name || uniSlug}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/uni/${uniSlug}/${facultySlug}`} className="hover:text-foreground">
            {course.faculty?.name || facultySlug}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{course.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <GraduationCap className="h-4 w-4" />
            <Link to={`/uni/${uniSlug}/${facultySlug}`} className="hover:text-foreground">
              {course.faculty?.name}
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-3">{course.name}</h1>
          {course.description && (
            <p className="text-muted-foreground max-w-2xl">{course.description}</p>
          )}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Anul {course.year}
            </Badge>
            {course.semester && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Semestrul {course.semester}
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {notesCount} notițe
            </Badge>
          </div>
        </header>

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
                      Materiale încărcate de colegi pentru {course.name}
                    </p>
                  </div>
                </div>
                <Link to={`/notes?subject=${encodeURIComponent(course.name)}`}>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Vezi notițele
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Be First to Upload */}
        {notesCount === 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Fii primul care contribuie! 🎉
                </h2>
                <p className="text-muted-foreground mb-4">
                  Nu există încă notițe pentru cursul <strong>{course.name}</strong>. 
                  Încarcă primele notițe și ajută colegii tăi!
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

        {/* CTA Section */}
        <section className="mt-12 text-center py-8 border-t">
          <h2 className="text-lg font-semibold mb-2">
            Ai notițe pentru {course.name}?
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
  );
}
