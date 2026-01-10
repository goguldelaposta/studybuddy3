import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, RefreshCw, UserPlus, MessageCircle, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  profileId: string;
  matchScore: number;
  reason: string;
  profile: {
    id: string;
    fullName: string;
    faculty: string;
    yearOfStudy: number;
    bio: string | null;
    avatarUrl: string | null;
    lookingFor: string;
    skills: string[];
    subjects: string[];
    userId?: string;
  };
}

interface AIRecommendationsProps {
  isAuthenticated: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-blue-600 bg-blue-100";
  return "text-orange-600 bg-orange-100";
};

export const AIRecommendations = ({ isAuthenticated }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Autentificare necesară",
        description: "Te rugăm să te conectezi pentru recomandări personalizate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nu există sesiune activă");
      }

      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Nu s-au putut obține recomandări",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setRecommendations(data.recommendations || []);
      setHasLoaded(true);

      if (data.recommendations?.length > 0) {
        toast({
          title: "Recomandări gata!",
          description: `Am găsit ${data.recommendations.length} colegi potriviți pentru tine`,
        });
      } else {
        toast({
          title: "Nicio potrivire încă",
          description: data.message || "Încearcă din nou când mai mulți studenți se alătură",
        });
      }
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      
      // Handle rate limit and payment errors
      if (error.message?.includes('429') || error.status === 429) {
        toast({
          title: "Prea multe cereri",
          description: "Te rugăm să aștepți puțin și să încerci din nou",
          variant: "destructive",
        });
      } else if (error.message?.includes('402') || error.status === 402) {
        toast({
          title: "Credit insuficient",
          description: "Contactează administratorul pentru mai multe credite AI",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Eroare",
          description: error.message || "Nu s-au putut obține recomandările",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (userId: string | undefined) => {
    if (userId) {
      navigate(`/messages?userId=${userId}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="glass border-border/50 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-primary" />
            Recomandări AI
          </CardTitle>
          <CardDescription>
            Conectează-te pentru a primi recomandări personalizate de colegi folosind AI
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50 overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-display">
              <Sparkles className="w-5 h-5 text-primary animate-pulse-soft" />
              Recomandări AI
            </CardTitle>
            <CardDescription className="mt-1">
              Potriviri inteligente bazate pe competențe, materii și obiective
            </CardDescription>
          </div>
          <Button
            onClick={fetchRecommendations}
            disabled={loading}
            className="gradient-primary text-primary-foreground"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analizez...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {hasLoaded ? "Reîmprospătează" : "Găsește Colegi"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {!hasLoaded && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full gradient-primary opacity-20 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Apasă "Găsește Colegi" pentru a descoperi parteneri de studiu folosind AI
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Analizez profilurile și găsesc cele mai bune potriviri...
            </p>
          </div>
        )}

        {hasLoaded && recommendations.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nicio potrivire găsită încă. Mai mulți studenți se vor alătura în curând!
            </p>
          </div>
        )}

        {recommendations.map((rec, index) => (
          <div
            key={rec.profileId}
            className="p-4 rounded-xl bg-card border border-border/50 hover-lift animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              {/* Match Score */}
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${getScoreColor(rec.matchScore)}`}>
                  {rec.matchScore}%
                </div>
                <span className="text-xs text-muted-foreground mt-1">Potrivire</span>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={rec.profile.avatarUrl || undefined} />
                    <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                      {getInitials(rec.profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-display font-semibold">{rec.profile.fullName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {rec.profile.faculty} • Anul {rec.profile.yearOfStudy}
                    </p>
                  </div>
                </div>

                {/* AI Reason */}
                <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-muted/50">
                  <TrendingUp className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>

                {/* Skills */}
                {rec.profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rec.profile.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {rec.profile.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{rec.profile.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMessage(rec.profile.userId)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Mesaj
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
