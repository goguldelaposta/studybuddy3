import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Loader2, Search, Edit, Trash2, Save, X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  faculty: string;
  bio: string | null;
  avatar_url: string | null;
  year_of_study: number | null;
  looking_for: string | null;
  created_at: string;
  university_id: string | null;
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

interface EmailStatusMap {
  [userId: string]: {
    email_confirmed: boolean;
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
  };
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export const UserProfileEditor = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [emailStatusMap, setEmailStatusMap] = useState<EmailStatusMap>({});
  const [loading, setLoading] = useState(true);
  const [loadingEmailStatus, setLoadingEmailStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmailStatus = async () => {
    try {
      setLoadingEmailStatus(true);
      const { data, error } = await supabase.functions.invoke("get-users-email-status");
      
      if (error) {
        console.error("Error fetching email status:", error);
        return;
      }
      
      if (data?.emailStatusMap) {
        setEmailStatusMap(data.emailStatusMap);
      }
    } catch (error) {
      console.error("Error fetching email status:", error);
    } finally {
      setLoadingEmailStatus(false);
    }
  };

  const fetchData = async () => {
    try {
      const [{ data: profiles }, { data: unis }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("universities").select("id, name, short_name"),
      ]);
      setUsers(profiles || []);
      setUniversities(unis || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmailStatus();
  }, []);

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditedUser({
      full_name: user.full_name,
      email: user.email,
      faculty: user.faculty,
      bio: user.bio,
      year_of_study: user.year_of_study,
      looking_for: user.looking_for,
      university_id: user.university_id,
    });
    setShowEditDialog(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedUser.full_name,
          faculty: editedUser.faculty,
          bio: editedUser.bio,
          year_of_study: editedUser.year_of_study,
          looking_for: editedUser.looking_for,
          university_id: editedUser.university_id,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Profil actualizat",
        description: "Profilul utilizatorului a fost actualizat cu succes.",
      });
      setShowEditDialog(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !isAdmin) return;
    setActionLoading(true);

    try {
      // Delete profile (cascade should handle related data)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id);

      if (error) throw error;

      toast({
        title: "Profil șters",
        description: "Profilul utilizatorului a fost șters.",
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Eroare la ștergere",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Editare Profiluri Utilizatori</CardTitle>
          <CardDescription>Modifică informațiile profilurilor utilizatorilor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Caută după nume sau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizator</TableHead>
                  <TableHead>Facultate</TableHead>
                  <TableHead>An</TableHead>
                  <TableHead>Status Email</TableHead>
                  <TableHead>Data înregistrării</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const emailStatus = user.user_id ? emailStatusMap[user.user_id] : null;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.faculty}</TableCell>
                      <TableCell>{user.year_of_study || "-"}</TableCell>
                      <TableCell>
                        {loadingEmailStatus ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : emailStatus ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {emailStatus.email_confirmed ? (
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verificat
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Neverificat
                                  </Badge>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {emailStatus.email_confirmed ? (
                                  <p>Verificat la: {emailStatus.email_confirmed_at ? new Date(emailStatus.email_confirmed_at).toLocaleString("ro-RO") : "N/A"}</p>
                                ) : (
                                  <p>Email-ul nu a fost încă confirmat</p>
                                )}
                                {emailStatus.last_sign_in_at && (
                                  <p className="text-xs opacity-80">Ultima autentificare: {new Date(emailStatus.last_sign_in_at).toLocaleString("ro-RO")}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Necunoscut
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("ro-RO")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editare Profil</DialogTitle>
            <DialogDescription>Modifică informațiile profilului</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nume complet</label>
              <Input
                value={editedUser.full_name || ""}
                onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Facultate</label>
              <Input
                value={editedUser.faculty || ""}
                onChange={(e) => setEditedUser({ ...editedUser, faculty: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Universitate</label>
              <Select
                value={editedUser.university_id || ""}
                onValueChange={(value) => setEditedUser({ ...editedUser, university_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selectează universitatea" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">An de studiu</label>
              <Select
                value={editedUser.year_of_study?.toString() || ""}
                onValueChange={(value) => setEditedUser({ ...editedUser, year_of_study: parseInt(value) })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selectează anul" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Anul {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={editedUser.bio || ""}
                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ce caută</label>
              <Input
                value={editedUser.looking_for || ""}
                onChange={(e) => setEditedUser({ ...editedUser, looking_for: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Anulează
            </Button>
            <Button onClick={handleSaveUser} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvează
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va șterge permanent profilul lui{" "}
              <strong>{userToDelete?.full_name}</strong>. Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
