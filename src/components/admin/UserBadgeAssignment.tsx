import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Award, Zap, Hand } from "lucide-react";
import { ProfileBadge } from "@/components/ProfileBadge";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  is_manual: boolean;
  automatic_criteria: string | null;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: BadgeType;
}

interface UserBadgeAssignmentProps {
  userId: string;
  userName: string;
}

export const UserBadgeAssignment = ({ userId, userName }: UserBadgeAssignmentProps) => {
  const { toast } = useToast();
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch all badges
      const { data: badges } = await supabase
        .from("badges")
        .select("*")
        .order("category");

      // Fetch user's badges
      const { data: userBadgesData } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("user_id", userId);

      setAllBadges(badges || []);
      
      const mappedBadges = (userBadgesData || []).map((ub: any) => ({
        id: ub.id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        badge: ub.badge as BadgeType,
      }));
      setUserBadges(mappedBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAssignBadge = async (badgeId: string) => {
    setActionLoading(badgeId);
    try {
      const { error } = await supabase
        .from("user_badges")
        .insert({
          user_id: userId,
          badge_id: badgeId,
        });

      if (error) throw error;

      toast({
        title: "Insignă acordată",
        description: "Insigna a fost acordată cu succes.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveBadge = async (userBadgeId: string) => {
    setActionLoading(userBadgeId);
    try {
      const { error } = await supabase
        .from("user_badges")
        .delete()
        .eq("id", userBadgeId);

      if (error) throw error;

      toast({
        title: "Insignă revocată",
        description: "Insigna a fost revocată de la utilizator.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const userBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));
  const availableBadges = allBadges.filter((b) => !userBadgeIds.has(b.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-primary" />
          Asignare Insigne
        </CardTitle>
        <CardDescription>
          Gestionează insignele pentru <strong>{userName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Badges */}
        <div>
          <h4 className="text-sm font-medium mb-3">Insigne actuale ({userBadges.length})</h4>
          {userBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userBadges.map((ub) => (
                <div
                  key={ub.id}
                  className="inline-flex items-center gap-1 bg-muted/50 rounded-full pr-1"
                >
                  <ProfileBadge
                    name={ub.badge.name}
                    description={ub.badge.description}
                    icon={ub.badge.icon}
                    color={ub.badge.color}
                    size="sm"
                    showTooltip={false}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveBadge(ub.id)}
                    disabled={actionLoading === ub.id}
                  >
                    {actionLoading === ub.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Utilizatorul nu are nicio insignă.</p>
          )}
        </div>

        {/* Available Badges to Assign */}
        <div>
          <h4 className="text-sm font-medium mb-3">Insigne disponibile ({availableBadges.length})</h4>
          {availableBadges.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {availableBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ProfileBadge
                      name={badge.name}
                      description={badge.description}
                      icon={badge.icon}
                      color={badge.color}
                      size="sm"
                      showTooltip={false}
                    />
                    <div className="flex items-center gap-2">
                      {badge.is_manual ? (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Hand className="w-2 h-2" />
                          Manual
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-500/30">
                          <Zap className="w-2 h-2" />
                          Automat
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignBadge(badge.id)}
                    disabled={actionLoading === badge.id}
                    className="gap-1"
                  >
                    {actionLoading === badge.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Acordă
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Toate insignele au fost acordate.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
