import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, Megaphone, MessageSquare, UserPlus, TrendingUp, Calendar, Activity } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  totalAnnouncements: number;
  totalMessages: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeAnnouncements: number;
  pendingModerations: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
          { count: totalUsers },
          { count: totalGroups },
          { count: totalAnnouncements },
          { count: totalMessages },
          { count: newUsersThisWeek },
          { count: newUsersThisMonth },
          { count: activeAnnouncements },
          { count: pendingAnnouncements },
          { count: pendingGroups },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("groups").select("*", { count: "exact", head: true }),
          supabase.from("announcements").select("*", { count: "exact", head: true }),
          supabase.from("messages").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", oneMonthAgo.toISOString()),
          supabase.from("announcements").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("announcements").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
          supabase.from("groups").select("*", { count: "exact", head: true }).eq("moderation_status", "pending"),
        ]);

        // Fetch recent activity
        const { data: recentProfiles } = await supabase
          .from("profiles")
          .select("full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        const { data: recentAnnouncements } = await supabase
          .from("announcements")
          .select("title, created_at")
          .order("created_at", { ascending: false })
          .limit(3);

        const recentActivity = [
          ...(recentProfiles || []).map((p) => ({
            type: "user",
            description: `${p.full_name} s-a înregistrat`,
            timestamp: p.created_at,
          })),
          ...(recentAnnouncements || []).map((a) => ({
            type: "announcement",
            description: `Anunț nou: ${a.title}`,
            timestamp: a.created_at,
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setStats({
          totalUsers: totalUsers || 0,
          totalGroups: totalGroups || 0,
          totalAnnouncements: totalAnnouncements || 0,
          totalMessages: totalMessages || 0,
          newUsersThisWeek: newUsersThisWeek || 0,
          newUsersThisMonth: newUsersThisMonth || 0,
          activeAnnouncements: activeAnnouncements || 0,
          pendingModerations: (pendingAnnouncements || 0) + (pendingGroups || 0),
          recentActivity,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `acum ${diffMins} minute`;
    if (diffHours < 24) return `acum ${diffHours} ore`;
    return `acum ${diffDays} zile`;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Utilizatori</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats.newUsersThisWeek} săptămâna asta
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Grupuri</p>
                <p className="text-3xl font-bold">{stats.totalGroups}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Anunțuri</p>
                <p className="text-3xl font-bold">{stats.totalAnnouncements}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeAnnouncements} active
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Mesaje</p>
                <p className="text-3xl font-bold">{stats.totalMessages}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
                <p className="text-sm text-muted-foreground">Utilizatori noi luna asta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingModerations}</p>
                <p className="text-sm text-muted-foreground">Moderări în așteptare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeAnnouncements}</p>
                <p className="text-sm text-muted-foreground">Anunțuri active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activitate Recentă
          </CardTitle>
          <CardDescription>Ultimele acțiuni pe platformă</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nicio activitate recentă</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "user" ? "bg-primary/10" : "bg-amber-500/10"
                  }`}>
                    {activity.type === "user" ? (
                      <Users className="w-4 h-4 text-primary" />
                    ) : (
                      <Megaphone className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
