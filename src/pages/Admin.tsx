import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useUserRoles, AppRole } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ReportsManagement } from "@/components/admin/ReportsManagement";
import { SuspensionsManagement } from "@/components/admin/SuspensionsManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { GroupsModeration } from "@/components/admin/GroupsModeration";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserProfileEditor } from "@/components/admin/UserProfileEditor";
import { UniversitiesManagement } from "@/components/admin/UniversitiesManagement";
import { SubjectsManagement } from "@/components/admin/SubjectsManagement";
import { SkillsManagement } from "@/components/admin/SkillsManagement";
import { 
  Shield, Users, Search, Loader2, Trash2, 
  Crown, ShieldCheck, User as UserIcon, AlertTriangle,
  Flag, Ban, Megaphone, UserX, LayoutDashboard, Edit, Building2, BookOpen, Lightbulb, Mail, ShieldAlert, ShieldBan, Send, Award
} from "lucide-react";
import { NewsletterSender } from "@/components/admin/NewsletterSender";
import { SecurityLogs } from "@/components/admin/SecurityLogs";
import { BlockedIPsManagement } from "@/components/admin/BlockedIPsManagement";
import { IPWhitelistManagement } from "@/components/admin/IPWhitelistManagement";
import { AutomatedEmailsLog } from "@/components/admin/AutomatedEmailsLog";
import { BadgesManagement } from "@/components/admin/BadgesManagement";
import { useBlockedIPsNotifications } from "@/hooks/useBlockedIPsNotifications";
import { useModeration } from "@/hooks/useModeration";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface UserWithRoles {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  faculty: string;
  created_at: string;
  roles: AppRole[];
}

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const getRoleBadge = (role: AppRole) => {
  switch (role) {
    case "admin":
      return (
        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
          <Crown className="w-3 h-3 mr-1" />Admin
        </Badge>
      );
    case "moderator":
      return (
        <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
          <ShieldCheck className="w-3 h-3 mr-1" />Moderator
        </Badge>
      );
    default:
      return <Badge variant="secondary"><UserIcon className="w-3 h-3 mr-1" />User</Badge>;
  }
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentUserProfile } = useProfiles();
  const { isAdmin, isModerator, loading: rolesLoading, assignRole, removeRole } = useUserRoles();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Suspension dialog state
  const { suspendUser, refreshSuspensions } = useModeration();
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserWithRoles | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionDuration, setSuspensionDuration] = useState("permanent");

  // Real-time notifications for blocked IPs
  useBlockedIPsNotifications();

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, avatar_url, faculty, created_at")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase.from("user_roles").select("user_id, role");

      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const userRoles = (roles || [])
          .filter((r: any) => r.user_id === profile.user_id)
          .map((r: any) => r.role as AppRole);
        return { ...profile, roles: userRoles.length > 0 ? userRoles : ["user" as AppRole] };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isModerator) fetchUsers();
  }, [isAdmin, isModerator]);

  const handleAssignRole = async (targetUserId: string, role: AppRole) => {
    setActionLoading(targetUserId);
    const result = await assignRole(targetUserId, role);
    if (result.success) {
      toast({ title: "Rol atribuit", description: `Rolul "${role}" a fost atribuit.` });
      fetchUsers();
    } else {
      toast({ title: "Eroare", description: result.error, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleRemoveRole = async (targetUserId: string, role: AppRole) => {
    if (targetUserId === user?.id && role === "admin") {
      toast({ title: "Acțiune interzisă", description: "Nu îți poți elimina propriul rol de admin.", variant: "destructive" });
      return;
    }
    setActionLoading(targetUserId);
    const result = await removeRole(targetUserId, role);
    if (result.success) {
      toast({ title: "Rol eliminat", description: `Rolul "${role}" a fost eliminat.` });
      fetchUsers();
    } else {
      toast({ title: "Eroare", description: result.error, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleSuspendUser = async () => {
    if (!userToSuspend || !suspensionReason) return;

    setActionLoading(userToSuspend.user_id);
    
    let suspendedUntil: string | undefined;
    if (suspensionDuration !== "permanent") {
      const date = new Date();
      switch (suspensionDuration) {
        case "1day": date.setDate(date.getDate() + 1); break;
        case "3days": date.setDate(date.getDate() + 3); break;
        case "7days": date.setDate(date.getDate() + 7); break;
        case "30days": date.setDate(date.getDate() + 30); break;
      }
      suspendedUntil = date.toISOString();
    }

    const result = await suspendUser(userToSuspend.user_id, suspensionReason, suspendedUntil);
    
    if (result.success) {
      toast({
        title: "Utilizator suspendat",
        description: `${userToSuspend.full_name} a fost suspendat cu succes.`,
      });
      setShowSuspendDialog(false);
      setUserToSuspend(null);
      setSuspensionReason("");
      setSuspensionDuration("permanent");
      refreshSuspensions();
    } else {
      toast({
        title: "Eroare la suspendare",
        description: result.error || "Nu s-a putut suspenda utilizatorul.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || u.roles.includes(selectedRole as AppRole);
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.roles.includes("admin")).length,
    moderators: users.filter((u) => u.roles.includes("moderator")).length,
  };

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={!!user} user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null} onSignOut={signOut} />
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={!!user} user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null} onSignOut={signOut} />
        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Acces restricționat</h3>
              <p className="text-muted-foreground mb-4">Nu ai permisiunea să accesezi această pagină.</p>
              <Button onClick={() => navigate("/")}>Înapoi la pagina principală</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null} onSignOut={signOut} />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Panou de Administrare</h1>
            <p className="text-muted-foreground">Gestionează utilizatorii, rapoartele și conținutul</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="flex items-center gap-4 p-6"><div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total utilizatori</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center"><Crown className="w-6 h-6 text-amber-500" /></div><div><p className="text-2xl font-bold">{stats.admins}</p><p className="text-sm text-muted-foreground">Administratori</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-blue-500" /></div><div><p className="text-2xl font-bold">{stats.moderators}</p><p className="text-sm text-muted-foreground">Moderatori</p></div></CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /><span className="hidden sm:inline">Utilizatori</span></TabsTrigger>
            <TabsTrigger value="profiles" className="gap-2"><Edit className="w-4 h-4" /><span className="hidden sm:inline">Profiluri</span></TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><Flag className="w-4 h-4" /><span className="hidden sm:inline">Rapoarte</span></TabsTrigger>
            <TabsTrigger value="suspensions" className="gap-2"><Ban className="w-4 h-4" /><span className="hidden sm:inline">Suspendări</span></TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2"><Megaphone className="w-4 h-4" /><span className="hidden sm:inline">Anunțuri</span></TabsTrigger>
            <TabsTrigger value="groups" className="gap-2"><Users className="w-4 h-4" /><span className="hidden sm:inline">Grupuri</span></TabsTrigger>
            <TabsTrigger value="universities" className="gap-2"><Building2 className="w-4 h-4" /><span className="hidden sm:inline">Universități</span></TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Materii</span></TabsTrigger>
            <TabsTrigger value="skills" className="gap-2"><Lightbulb className="w-4 h-4" /><span className="hidden sm:inline">Skills</span></TabsTrigger>
            <TabsTrigger value="newsletter" className="gap-2"><Mail className="w-4 h-4" /><span className="hidden sm:inline">Newsletter</span></TabsTrigger>
            <TabsTrigger value="automated-emails" className="gap-2"><Send className="w-4 h-4" /><span className="hidden sm:inline">Emailuri Auto</span></TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><ShieldAlert className="w-4 h-4" /><span className="hidden sm:inline">Securitate</span></TabsTrigger>
            <TabsTrigger value="blocked-ips" className="gap-2"><ShieldBan className="w-4 h-4" /><span className="hidden sm:inline">IP Blocate</span></TabsTrigger>
            <TabsTrigger value="whitelist" className="gap-2"><ShieldCheck className="w-4 h-4" /><span className="hidden sm:inline">Whitelist</span></TabsTrigger>
            <TabsTrigger value="badges" className="gap-2"><Award className="w-4 h-4" /><span className="hidden sm:inline">Insigne</span></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><AdminDashboard /></TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Gestionare Utilizatori</CardTitle><CardDescription>Atribuie sau elimină roluri</CardDescription></CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Caută..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}><SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toate rolurile</SelectItem><SelectItem value="admin">Administratori</SelectItem><SelectItem value="moderator">Moderatori</SelectItem><SelectItem value="user">Utilizatori</SelectItem></SelectContent></Select>
                </div>
                {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilizator</TableHead>
                          <TableHead>Roluri</TableHead>
                          <TableHead>Data</TableHead>
                          {(isAdmin || isModerator) && <TableHead className="text-right">Acțiuni</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={u.avatar_url || undefined} />
                                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                                    {getInitials(u.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{u.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {u.roles.map((role) => <div key={role}>{getRoleBadge(role)}</div>)}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString("ro-RO")}
                            </TableCell>
                            {(isAdmin || isModerator) && (
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  {actionLoading === u.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      {/* Suspend button - visible for admin/mod, not for self */}
                                      {u.user_id !== user?.id && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                          onClick={() => {
                                            setUserToSuspend(u);
                                            setShowSuspendDialog(true);
                                          }}
                                        >
                                          <UserX className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {/* Admin-only role actions */}
                                      {isAdmin && (
                                        <>
                                          {!u.roles.includes("admin") && (
                                            <Button size="sm" variant="outline" onClick={() => handleAssignRole(u.user_id, "admin")}>
                                              <Crown className="w-4 h-4" />
                                            </Button>
                                          )}
                                          {!u.roles.includes("moderator") && (
                                            <Button size="sm" variant="outline" onClick={() => handleAssignRole(u.user_id, "moderator")}>
                                              <ShieldCheck className="w-4 h-4" />
                                            </Button>
                                          )}
                                          {u.roles.includes("admin") && u.user_id !== user?.id && (
                                            <Button size="sm" variant="destructive" onClick={() => handleRemoveRole(u.user_id, "admin")}>
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          )}
                                          {u.roles.includes("moderator") && (
                                            <Button size="sm" variant="destructive" onClick={() => handleRemoveRole(u.user_id, "moderator")}>
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          )}
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles"><UserProfileEditor /></TabsContent>
          <TabsContent value="reports"><ReportsManagement /></TabsContent>
          <TabsContent value="suspensions"><SuspensionsManagement /></TabsContent>
          <TabsContent value="announcements"><ContentModeration /></TabsContent>
          <TabsContent value="groups"><GroupsModeration /></TabsContent>
          <TabsContent value="universities"><UniversitiesManagement /></TabsContent>
          <TabsContent value="subjects"><SubjectsManagement /></TabsContent>
          <TabsContent value="skills"><SkillsManagement /></TabsContent>
          <TabsContent value="newsletter"><NewsletterSender /></TabsContent>
          <TabsContent value="automated-emails"><AutomatedEmailsLog /></TabsContent>
          <TabsContent value="security"><SecurityLogs /></TabsContent>
          <TabsContent value="blocked-ips"><BlockedIPsManagement /></TabsContent>
          <TabsContent value="whitelist"><IPWhitelistManagement /></TabsContent>
          <TabsContent value="badges"><BadgesManagement /></TabsContent>
        </Tabs>

        {/* Suspension Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Suspendă Utilizator</DialogTitle>
              <DialogDescription>
                {userToSuspend && `Suspendează contul lui ${userToSuspend.full_name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {userToSuspend && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userToSuspend.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(userToSuspend.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{userToSuspend.full_name}</p>
                      <p className="text-sm text-muted-foreground">{userToSuspend.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Durată suspendare</label>
                    <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1day">1 zi</SelectItem>
                        <SelectItem value="3days">3 zile</SelectItem>
                        <SelectItem value="7days">7 zile</SelectItem>
                        <SelectItem value="30days">30 zile</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Motiv suspendare *</label>
                    <Textarea
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="Descrie motivul suspendării..."
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuspendDialog(false);
                  setUserToSuspend(null);
                  setSuspensionReason("");
                }}
              >
                Anulează
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspendUser}
                disabled={!suspensionReason || actionLoading === userToSuspend?.user_id}
              >
                {actionLoading === userToSuspend?.user_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Suspendă
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
