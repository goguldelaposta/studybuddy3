import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, RefreshCw, UserPlus, MessageCircle, Star, TrendingUp, Zap } from "lucide-react";
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

  const fetchRecommendations = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to get personalized recommendations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Unable to get recommendations",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setRecommendations(data.recommendations || []);
      setHasLoaded(true);

      if (data.recommendations?.length > 0) {
        toast({
          title: "Recommendations ready!",
          description: `Found ${data.recommendations.length} potential teammates for you`,
        });
      } else {
        toast({
          title: "No matches yet",
          description: data.message || "Try again when more students join",
        });
      }
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="glass border-border/50 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Matches
          </CardTitle>
          <CardDescription>
            Sign in to get personalized teammate recommendations powered by AI
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
              AI-Powered Matches
            </CardTitle>
            <CardDescription className="mt-1">
              Smart recommendations based on your skills, subjects & goals
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
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {hasLoaded ? "Refresh" : "Get Matches"}
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
              Click "Get Matches" to find your ideal study partners using AI
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Analyzing profiles and finding your best matches...
            </p>
          </div>
        )}

        {hasLoaded && recommendations.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No matches found yet. More students will join soon!
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
                <span className="text-xs text-muted-foreground mt-1">Match</span>
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
                      {rec.profile.faculty} • Year {rec.profile.yearOfStudy}
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
                  <Button size="sm" className="gradient-primary text-primary-foreground">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
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
