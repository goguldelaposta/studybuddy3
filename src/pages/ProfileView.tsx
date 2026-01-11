import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useBadges } from "@/hooks/useBadges";
import { useFriendships } from "@/hooks/useFriendships";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileBadge } from "@/components/ProfileBadge";
import { FriendRequestButton } from "@/components/FriendRequestButton";
import { 
  GraduationCap, Building, BookOpen, MessageCircle, 
  Calendar, MapPin, ArrowLeft, Loader2, Award
} from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getLookingForLabel = (value: string) => {
  const labels: Record<string, string> = {
    "teammates": "Colegi de proiect",
    "study-group": "Grup de studiu",
    "mentor": "Mentor",
    "mentee": "Să fiu mentor",
    "tutoring": "Meditații",
  };
  return labels[value] || value;
};

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  faculty: string;
  year_of_study: number | null;
  bio: string | null;
  avatar_url: string | null;
  looking_for: string | null;
  created_at: string;
  university?: {
    name: string;
    short_name: string;
  };
  skills: string[];
  subjects: string[];
}

const ProfileView = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentUserProfile } = useProfiles();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { userBadges } = useBadges(userId);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        // Fetch profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*, university:universities(name, short_name)')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        // Fetch skills
        const { data: skillsData } = await supabase
          .from('profile_skills')
          .select('skills(name)')
          .eq('profile_id', profileData.id);

        // Fetch subjects
        const { data: subjectsData } = await supabase
          .from('profile_subjects')
          .select('subjects(name)')
          .eq('profile_id', profileData.id);

        setProfile({
          ...profileData,
          skills: skillsData?.map((s: any) => s.skills?.name).filter(Boolean) || [],
          subjects: subjectsData?.map((s: any) => s.subjects?.name).filter(Boolean) || [],
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          isAuthenticated={!!user}
          user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
          onSignOut={signOut}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          isAuthenticated={!!user}
          user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
          onSignOut={signOut}
        />
        <div className="container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="font-display font-semibold text-lg mb-2">Profil negăsit</h3>
              <p className="text-muted-foreground mb-4">Acest profil nu există sau a fost șters.</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
        onSignOut={signOut}
      />

      <div className="container py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi
        </Button>

        {/* Main Profile Card */}
        <Card className="overflow-hidden">
          <div className="h-32 gradient-primary" />
          <CardContent className="relative pt-0">
            {/* Avatar */}
            <Avatar className="absolute -top-16 left-6 h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-3xl font-display font-bold">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Actions */}
            <div className="flex justify-end pt-4 gap-2">
              {isOwnProfile ? (
                <Button onClick={() => navigate('/profile/edit')}>
                  Editează Profilul
                </Button>
              ) : (
                <>
                  {userId && <FriendRequestButton targetUserId={userId} />}
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/messages?with=${userId}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mesaj
                  </Button>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="mt-8 pt-4">
              <h1 className="font-display text-2xl font-bold">{profile.full_name}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground">
                {profile.university && (
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {profile.university.short_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {profile.faculty}
                </span>
                {profile.year_of_study && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Anul {profile.year_of_study}
                  </span>
                )}
              </div>

              {/* Badges */}
              {userBadges.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {userBadges.map((ub) => (
                      <ProfileBadge
                        key={ub.id}
                        name={ub.badge.name}
                        description={ub.badge.description}
                        icon={ub.badge.icon}
                        color={ub.badge.color}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-muted-foreground">{profile.bio}</p>
              )}

              {/* Looking for */}
              {profile.looking_for && (
                <div className="mt-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Caută:</span>
                  <Badge variant="secondary">{getLookingForLabel(profile.looking_for)}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Subjects */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Skills */}
          {profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Competențe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subjects */}
          {profile.subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Materii</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject) => (
                    <Badge key={subject} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Badges Card */}
        {userBadges.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Insigne câștigate ({userBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userBadges.map((ub) => (
                  <div 
                    key={ub.id} 
                    className="flex flex-col items-center p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <ProfileBadge
                      name={ub.badge.name}
                      description={ub.badge.description}
                      icon={ub.badge.icon}
                      color={ub.badge.color}
                      size="lg"
                      showTooltip={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(ub.earned_at).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
