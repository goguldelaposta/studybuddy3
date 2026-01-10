import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, GraduationCap, Sparkles, BookOpen, Building, Calendar } from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { universities, currentUserProfile, loading } = useProfiles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !loading && !currentUserProfile) {
      navigate("/profile/edit");
    }
  }, [user, authLoading, loading, currentUserProfile, navigate]);

  if (authLoading || !user || loading) return null;

  const university = universities.find((u) => u.id === currentUserProfile?.university_id);

  const getInitials = (name?: string) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "U";
  };

  const getLookingForLabel = (value?: string | null) => {
    const labels: Record<string, string> = {
      teammates: "Colegi de Proiect",
      "study-group": "Grup de Studiu",
      mentor: "Un Mentor",
      mentee: "Să fiu Mentor",
      tutoring: "Ajutor la Meditații",
    };
    return value ? labels[value] || value : "Nespecificat";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={true}
        user={{ email: user.email || "", fullName: currentUserProfile?.full_name }}
        onSignOut={signOut}
      />

      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          {/* Header with Settings Button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold">Profilul Meu</h1>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/profile/edit">
                <Settings className="w-4 h-4" />
                Setări
              </Link>
            </Button>
          </div>

          {currentUserProfile && (
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="shadow-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={currentUserProfile.avatar_url || undefined} />
                      <AvatarFallback className="gradient-primary text-primary-foreground text-xl">
                        {getInitials(currentUserProfile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{currentUserProfile.full_name}</h2>
                      <p className="text-muted-foreground">{user.email}</p>
                      {currentUserProfile.bio && (
                        <p className="mt-2 text-sm">{currentUserProfile.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Info */}
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Informații Academice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Universitate:</span>
                    <span>{university?.name || "Nespecificat"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Facultate:</span>
                    <span>{currentUserProfile.faculty || "Nespecificat"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Anul de studiu:</span>
                    <span>{currentUserProfile.year_of_study ? `Anul ${currentUserProfile.year_of_study}` : "Nespecificat"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Caut:</span>
                    <Badge variant="secondary">{getLookingForLabel(currentUserProfile.looking_for)}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              {currentUserProfile.skills && currentUserProfile.skills.length > 0 && (
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Competențe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentUserProfile.skills.map((skill) => (
                        <Badge key={skill} className="gradient-primary text-primary-foreground">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subjects */}
              {currentUserProfile.subjects && currentUserProfile.subjects.length > 0 && (
                <Card className="shadow-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      Materii
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentUserProfile.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
