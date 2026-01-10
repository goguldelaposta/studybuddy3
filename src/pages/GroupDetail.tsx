import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  BookOpen,
  Building2,
  Calendar,
  Crown,
  Shield,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useGroups, Group, GroupMember } from "@/hooks/useGroups";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { currentUserProfile } = useProfiles();
  const { fetchGroupById, fetchGroupMembers, joinGroup, leaveGroup } = useGroups();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch group data
  useEffect(() => {
    const loadGroup = async () => {
      if (!id || !user) return;

      setLoading(true);
      const groupData = await fetchGroupById(id);
      setGroup(groupData);

      if (groupData?.isCurrentUserMember) {
        const membersData = await fetchGroupMembers(id);
        setMembers(membersData);
      }

      setLoading(false);
    };

    if (user) {
      loadGroup();
    }
  }, [id, user, fetchGroupById, fetchGroupMembers]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  const handleJoin = async () => {
    if (!id) return;
    setActionLoading(true);
    const success = await joinGroup(id);
    if (success) {
      const groupData = await fetchGroupById(id);
      setGroup(groupData);
      if (groupData?.isCurrentUserMember) {
        const membersData = await fetchGroupMembers(id);
        setMembers(membersData);
      }
    }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    if (!id) return;
    setActionLoading(true);
    const success = await leaveGroup(id);
    if (success) {
      navigate("/groups");
    }
    setActionLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          isAuthenticated={!!user}
          user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
          onSignOut={signOut}
        />
        <div className="container py-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Grupul nu a fost găsit</h1>
          <p className="text-muted-foreground mb-6">
            Acest grup nu există sau nu ai permisiunea să-l vezi.
          </p>
          <Button asChild>
            <Link to="/groups">Înapoi la Grupuri</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
        onSignOut={signOut}
      />

      <div className="container py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/groups")}
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Grupuri
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-20 w-20 rounded-xl">
                    <AvatarImage src={group.avatar_url || undefined} />
                    <AvatarFallback className="rounded-xl gradient-primary text-primary-foreground text-2xl">
                      {getInitials(group.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{group.name}</h1>
                      {group.is_public ? (
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {group.subject && (
                        <Badge variant="secondary" className="gap-1">
                          <BookOpen className="h-3 w-3" />
                          {group.subject.name}
                        </Badge>
                      )}
                      {group.university && (
                        <Badge variant="outline" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {group.university.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {group.memberCount} / {group.max_members || 20} membri
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Creat {format(new Date(group.created_at), "d MMMM yyyy", { locale: ro })}
                      </span>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <>
                    <Separator className="mb-4" />
                    <div>
                      <h3 className="font-medium mb-2">Descriere</h3>
                      <p className="text-muted-foreground">{group.description}</p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Actions */}
                <div className="flex gap-3">
                  {group.isCurrentUserMember ? (
                    <>
                      <Button className="gradient-primary text-primary-foreground gap-2" disabled>
                        <MessageCircle className="h-4 w-4" />
                        Chat de Grup (în curând)
                      </Button>
                      {group.currentUserRole !== "admin" && (
                        <Button
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={handleLeave}
                          disabled={actionLoading}
                        >
                          Părăsește Grupul
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      className="gradient-primary text-primary-foreground"
                      onClick={handleJoin}
                      disabled={
                        actionLoading ||
                        (group.memberCount || 0) >= (group.max_members || 20)
                      }
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      Alătură-te Grupului
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Members */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membri ({group.memberCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.isCurrentUserMember ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.profile?.avatar_url || undefined} />
                            <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                              {member.profile
                                ? getInitials(member.profile.full_name)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {member.profile?.full_name || "Utilizator"}
                              </span>
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.profile?.faculty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-2" />
                    <p>Alătură-te grupului pentru a vedea membrii</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
