import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  BookOpen,
  Loader2,
  Edit,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Note {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  faculty: string | null;
  downloads: number;
  user_id: string;
  file_url: string | null;
  content: string | null;
  created_at: string;
  year: number | null;
}

interface Author {
  full_name: string;
  avatar_url: string | null;
}

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profiles } = useProfiles();
  const { toast } = useToast();
  
  const [note, setNote] = useState<Note | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const currentProfile = profiles.find(p => p.user_id === user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single();

        if (error) throw error;
        setNote(data);

        // Fetch author info
        if (data?.user_id) {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', data.user_id)
            .single();
          
          if (authorData) {
            setAuthor(authorData);
          }
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        toast({
          title: "Eroare",
          description: "Nu am putut încărca notița.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, toast]);

  const handleDownload = async () => {
    if (!note?.file_url) return;

    setDownloading(true);

    try {
      const link = document.createElement('a');
      link.href = note.file_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment download counter
      await supabase
        .from('notes')
        .update({ downloads: note.downloads + 1 })
        .eq('id', note.id);

      setNote(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);

      toast({
        title: "Succes!",
        description: "Fișierul se descarcă...",
      });
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut descărca fișierul.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          isAuthenticated={!!user}
          user={user ? { email: user.email || "", fullName: currentProfile?.full_name, avatarUrl: currentProfile?.avatar_url || undefined } : null}
          onSignOut={handleSignOut}
        />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          isAuthenticated={!!user}
          user={user ? { email: user.email || "", fullName: currentProfile?.full_name, avatarUrl: currentProfile?.avatar_url || undefined } : null}
          onSignOut={handleSignOut}
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Notiță negăsită</h2>
              <p className="text-muted-foreground mb-4">
                Această notiță nu există sau a fost ștearsă.
              </p>
              <Button onClick={() => navigate("/notes")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la notițe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(note.created_at).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentProfile?.full_name, avatarUrl: currentProfile?.avatar_url || undefined } : null}
        onSignOut={handleSignOut}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate("/notes")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la notițe
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">
              <BookOpen className="w-3 h-3 mr-1" />
              {note.subject}
            </Badge>
            {note.faculty && (
              <Badge variant="outline" className="text-sm">
                {note.faculty}
              </Badge>
            )}
            {note.year && (
              <Badge variant="outline" className="text-sm">
                Anul {note.year}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {note.title}
          </h1>

          {note.description && (
            <p className="text-lg text-muted-foreground mb-6">
              {note.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-4">
            {author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{author.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>{note.downloads} descărcări</span>
            </div>
            {user?.id === note.user_id && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/notes`}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editează
                </Link>
              </Button>
            )}
          </div>
        </header>

        {/* Content Section - Markdown Article */}
        {note.content && (
          <article className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground border-b pb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mt-5 mb-2 text-foreground">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-base leading-relaxed mb-4 text-foreground/90">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-1 text-foreground/90">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-1 text-foreground/90">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground/90">{children}</li>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-4 text-sm">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-8 border-border" />,
              }}
            >
              {note.content}
            </ReactMarkdown>
          </article>
        )}

        {/* Download Section - for file-based notes */}
        {note.file_url && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Fișier atașat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Descarcă fișierul original pentru a vedea conținutul complet.
                </p>
                <Button onClick={handleDownload} disabled={downloading}>
                  {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Descarcă
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No content fallback - should rarely happen due to DB constraint */}
        {!note.content && !note.file_url && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Această notiță nu are conținut disponibil.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}