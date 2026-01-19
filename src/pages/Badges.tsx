import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBadges } from "@/hooks/useBadges";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { ProfileBadge } from "@/components/ProfileBadge";
import { useNavigate } from "react-router-dom";
import { 
  Award, Trophy, Star, Target, CheckCircle2, Lock,
  Baby, UserCheck, UserPlus, Users, Network, 
  MessageCircle, MessagesSquare, Crown, Handshake, 
  Megaphone, Rocket, LucideIcon, ShieldCheck, BookOpen, Flame
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  'baby': Baby,
  'user-check': UserCheck,
  'user-plus': UserPlus,
  'users': Users,
  'network': Network,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  'crown': Crown,
  'handshake': Handshake,
  'megaphone': Megaphone,
  'award': Award,
  'rocket': Rocket,
  'shield-check': ShieldCheck,
  'book-open': BookOpen,
  'flame': Flame,
  'star': Star,
};

const categoryInfo: Record<string, { name: string; description: string; icon: LucideIcon; gradient: string }> = {
  'milestone': {
    name: 'Etape Importante',
    description: 'Insigne pentru momente cheie în călătoria ta',
    icon: Star,
    gradient: 'from-blue-500 to-indigo-600'
  },
  'social': {
    name: 'Socializare',
    description: 'Conectează-te cu alți studenți',
    icon: Users,
    gradient: 'from-pink-500 to-purple-600'
  },
  'communication': {
    name: 'Comunicare',
    description: 'Rămâi în contact cu colegii',
    icon: MessageCircle,
    gradient: 'from-teal-500 to-cyan-600'
  },
  'achievement': {
    name: 'Realizări',
    description: 'Completează acțiuni importante',
    icon: Trophy,
    gradient: 'from-green-500 to-emerald-600'
  },
  'leadership': {
    name: 'Leadership',
    description: 'Ia inițiativa și conduce',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-600'
  },
  'collaboration': {
    name: 'Colaborare',
    description: 'Lucrează împreună cu alții',
    icon: Handshake,
    gradient: 'from-emerald-500 to-green-600'
  },
  'contribution': {
    name: 'Contribuții',
    description: 'Contribuie la comunitate',
    icon: Target,
    gradient: 'from-orange-500 to-red-600'
  },
  'special': {
    name: 'Speciale',
    description: 'Insigne rare și exclusive',
    icon: Rocket,
    gradient: 'from-violet-500 to-purple-600'
  },
};

const howToEarn: Record<string, string> = {
  'Nou Venit': 'Creează un cont pe platformă',
  'Profil Complet': 'Completează toate câmpurile din profilul tău (nume, facultate, an, bio, abilități, materii)',
  'Primul Prieten': 'Trimite sau acceptă prima cerere de prietenie',
  'Social Butterfly': 'Acumulează cel puțin 5 prieteni pe platformă',
  'Networking Pro': 'Acumulează cel puțin 15 prieteni pe platformă',
  'Conversaționist': 'Trimite primul tău mesaj unui alt student',
  'Comunicator Activ': 'Trimite cel puțin 50 de mesaje pe platformă',
  'Lider de Grup': 'Creează un grup de studiu',
  'Colaborator': 'Alătură-te la cel puțin 3 grupuri de studiu',
  'Contributor': 'Publică un anunț pe platformă',
  'Veterean': 'Rămâi activ pe platformă timp de cel puțin 30 de zile',
  'Early Adopter': 'Te-ai înregistrat în primele luni ale lansării platformei',
};

export default function Badges() {
  const { user, signOut } = useAuth();
  const { profiles } = useProfiles();
  const navigate = useNavigate();
  const { badges, userBadges, loading } = useBadges();

  const currentProfile = profiles.find(p => p.user_id === user?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const totalBadges = badges.length;
  const earnedCount = userBadges.length;
  const progress = totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0;

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar 
        isAuthenticated={!!user} 
        user={user ? { email: user.email || "", fullName: currentProfile?.full_name, avatarUrl: currentProfile?.avatar_url || undefined } : null}
        onSignOut={handleSignOut}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Award className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Colecția de Insigne
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Câștigă insigne completând diverse acțiuni pe platformă. Fiecare insignă reprezintă o realizare unică!
          </p>
        </div>

        {/* Progress Card */}
        {user && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Progresul Tău</h3>
                  <p className="text-muted-foreground">
                    Ai câștigat <span className="font-bold text-primary">{earnedCount}</span> din <span className="font-bold">{totalBadges}</span> insigne disponibile
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Progress value={progress} className="h-3" />
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {Math.round(progress)}%
                  </Badge>
                </div>
              </div>
              
              {/* Quick view of earned badges */}
              {earnedCount > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Insignele tale:</p>
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
            </CardContent>
          </Card>
        )}

        {/* Badges by Category */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
              const info = categoryInfo[category] || {
                name: category,
                description: '',
                icon: Award,
                gradient: 'from-gray-500 to-gray-600'
              };
              const CategoryIcon = info.icon;

              return (
                <Card key={category} className="overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${info.gradient} text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{info.name}</CardTitle>
                        <CardDescription className="text-white/80">
                          {info.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryBadges.map((badge) => {
                        const isEarned = earnedBadgeIds.has(badge.id);
                        const IconComponent = iconMap[badge.icon] || Award;

                        return (
                          <div
                            key={badge.id}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              isEarned
                                ? 'border-primary/30 bg-primary/5 shadow-md'
                                : 'border-border bg-muted/30 opacity-75'
                            }`}
                          >
                            {/* Earned indicator */}
                            {isEarned && (
                              <div className="absolute -top-2 -right-2">
                                <div className="bg-green-500 text-white rounded-full p-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                            
                            {/* Locked indicator */}
                            {!isEarned && !user && (
                              <div className="absolute -top-2 -right-2">
                                <div className="bg-muted text-muted-foreground rounded-full p-1">
                                  <Lock className="w-4 h-4" />
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <div className={`p-3 rounded-xl ${
                                isEarned 
                                  ? `bg-gradient-to-br ${info.gradient} text-white`
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {badge.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {badge.description}
                                </p>
                              </div>
                            </div>

                            {/* How to earn */}
                            <div className={`mt-3 pt-3 border-t ${isEarned ? 'border-primary/20' : 'border-border'}`}>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Cum să câștigi:</span>{' '}
                                {howToEarn[badge.name] || badge.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-xl">
                <Star className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Sfaturi pentru a câștiga insigne</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Completează-ți profilul cu toate informațiile pentru a primi insigna "Profil Complet"
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Conectează-te cu colegi din facultatea ta pentru insigne sociale
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Participă activ în grupuri de studiu pentru a deveni un colaborator
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Publică anunțuri pentru a ajuta comunitatea și a câștiga insigne de contribuție
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
