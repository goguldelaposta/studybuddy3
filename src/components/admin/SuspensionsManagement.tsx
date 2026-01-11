import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useModeration, Suspension } from "@/hooks/useModeration";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { 
  Ban, Search, Loader2, UserX, CheckCircle, Clock, 
  Calendar, AlertTriangle, Unlock
} from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface UserForSuspension {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export const SuspensionsManagement = () => {
  const { suspensions, loading, suspendUser, liftSuspension, refreshSuspensions } = useModeration();
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New suspension dialog state
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserForSuspension[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserForSuspension | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionDuration, setSuspensionDuration] = useState("permanent");
  const [searchLoading, setSearchLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, avatar_url")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspensionReason) return;

    setActionLoading("suspend");
    
    let suspendedUntil: string | undefined;
    if (suspensionDuration !== "permanent") {
      const date = new Date();
      switch (suspensionDuration) {
        case "1day":
          date.setDate(date.getDate() + 1);
          break;
        case "3days":
          date.setDate(date.getDate() + 3);
          break;
        case "7days":
          date.setDate(date.getDate() + 7);
          break;
        case "30days":
          date.setDate(date.getDate() + 30);
          break;
      }
      suspendedUntil = date.toISOString();
    }

    const result = await suspendUser(selectedUser.user_id, suspensionReason, suspendedUntil);
    
    if (result.success) {
      toast({
        title: "Utilizator suspendat",
        description: `${selectedUser.full_name} a fost suspendat.`,
      });
      setShowSuspendDialog(false);
      setSelectedUser(null);
      setSuspensionReason("");
      setSuspensionDuration("permanent");
      setUserSearch("");
      setSearchResults([]);
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut suspenda utilizatorul.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const handleLiftSuspension = async (suspension: Suspension) => {
    setActionLoading(suspension.id);
    const result = await liftSuspension(suspension.id);
    
    if (result.success) {
      toast({
        title: "Suspendare ridicată",
        description: `Suspendarea pentru ${suspension.user?.full_name} a fost ridicată.`,
      });
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut ridica suspendarea.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const filteredSuspensions = suspensions.filter((s) => {
    const matchesSearch =
      s.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesActive = showActive ? s.is_active : !s.is_active;

    return matchesSearch && matchesActive;
  });

  const activeCount = suspensions.filter((s) => s.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Suspendări
              {activeCount > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground">
                  {activeCount} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Gestionează suspendările utilizatorilor
            </CardDescription>
          </div>
          <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserX className="w-4 h-4 mr-2" />
                Suspendă utilizator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Suspendă Utilizator</DialogTitle>
                <DialogDescription>
                  Caută și selectează utilizatorul pe care vrei să-l suspendezi
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!selectedUser ? (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Caută după nume sau email..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        className="pl-9"
                      />
                    </div>
                    {searchLoading && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded-md overflow-hidden">
                        {searchResults.map((u) => (
                          <button
                            key={u.id}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left transition-colors"
                            onClick={() => setSelectedUser(u)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(u.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{u.full_name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedUser.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(selectedUser.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{selectedUser.full_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(null)}
                      >
                        Schimbă
                      </Button>
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
              {selectedUser && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuspendDialog(false)}
                  >
                    Anulează
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleSuspendUser}
                    disabled={!suspensionReason || actionLoading === "suspend"}
                  >
                    {actionLoading === "suspend" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Suspendă
                      </>
                    )}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută suspendări..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={showActive ? "active" : "inactive"} onValueChange={(v) => setShowActive(v === "active")}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Ridicate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredSuspensions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nu există suspendări {showActive ? "active" : "ridicate"}</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizator</TableHead>
                  <TableHead>Motiv</TableHead>
                  <TableHead>Suspendat de</TableHead>
                  <TableHead>Expiră</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && showActive && <TableHead className="text-right">Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuspensions.map((suspension) => (
                  <TableRow key={suspension.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {suspension.user?.full_name ? getInitials(suspension.user.full_name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{suspension.user?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{suspension.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {suspension.reason}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {suspension.suspended_by_user?.full_name || "Necunoscut"}
                    </TableCell>
                    <TableCell>
                      {suspension.suspended_until ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {new Date(suspension.suspended_until).toLocaleDateString("ro-RO")}
                        </div>
                      ) : (
                        <Badge variant="destructive">Permanent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {suspension.is_active ? (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Activ
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ridicat
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && showActive && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLiftSuspension(suspension)}
                          disabled={actionLoading === suspension.id}
                        >
                          {actionLoading === suspension.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-1" />
                              Ridică
                            </>
                          )}
                        </Button>
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
  );
};
