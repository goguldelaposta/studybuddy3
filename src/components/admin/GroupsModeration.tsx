import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useModeration } from "@/hooks/useModeration";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Search, Loader2, Eye, CheckCircle, XCircle, 
  Clock, Trash2, Globe, Lock
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  moderation_status: string;
  moderation_notes: string | null;
  member_count: number;
  creator?: {
    full_name: string;
    email: string;
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          În așteptare
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobat
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <XCircle className="w-3 h-3 mr-1" />
          Respins
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const GroupsModeration = () => {
  const { moderateContent, deleteContent } = useModeration();
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, description, is_public, created_by, created_at, moderation_status, moderation_notes")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch creator profiles and member counts
      const groupsWithDetails = await Promise.all(
        (data || []).map(async (group: any) => {
          const { data: creatorProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", group.created_by)
            .single();

          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          return {
            ...group,
            creator: creatorProfile,
            member_count: count || 0,
          };
        })
      );

      setGroups(groupsWithDetails);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleModerate = async (status: "approved" | "rejected") => {
    if (!selectedGroup) return;

    setActionLoading(selectedGroup.id);
    const result = await moderateContent("groups", selectedGroup.id, status, moderationNotes);
    
    if (result.success) {
      toast({
        title: status === "approved" ? "Grup aprobat" : "Grup respins",
        description: `Grupul "${selectedGroup.name}" a fost ${status === "approved" ? "aprobat" : "respins"}.`,
      });
      setSelectedGroup(null);
      setModerationNotes("");
      fetchGroups();
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut modera grupul.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const handleDelete = async (group: Group) => {
    if (!isAdmin) {
      toast({
        title: "Acces interzis",
        description: "Doar administratorii pot șterge grupuri.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(group.id);
    const result = await deleteContent("groups", group.id);
    
    if (result.success) {
      toast({
        title: "Grup șters",
        description: `Grupul "${group.name}" a fost șters permanent.`,
      });
      fetchGroups();
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut șterge grupul.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.creator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || g.moderation_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = groups.filter((g) => g.moderation_status === "pending").length;

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
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Moderare Grupuri
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
              {pendingCount} în așteptare
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Aprobă sau respinge grupurile create de utilizatori
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută grupuri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrează după status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="pending">În așteptare</SelectItem>
              <SelectItem value="approved">Aprobate</SelectItem>
              <SelectItem value="rejected">Respinse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nu există grupuri</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Membri</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {group.name}
                    </TableCell>
                    <TableCell>
                      {group.is_public ? (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Privat
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.creator?.full_name || "Necunoscut"}
                    </TableCell>
                    <TableCell>{group.member_count}</TableCell>
                    <TableCell>{getStatusBadge(group.moderation_status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(group.created_at).toLocaleDateString("ro-RO")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {actionLoading === group.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedGroup(group)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {group.name}
                                    {group.is_public ? (
                                      <Globe className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Creat de {group.creator?.full_name} • {group.member_count} membri
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {group.description && (
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">Descriere</p>
                                      <p className="text-sm">{group.description}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    {getStatusBadge(group.moderation_status)}
                                  </div>
                                  {group.moderation_status === "pending" && (
                                    <div>
                                      <label className="text-sm font-medium">Note moderare (opțional)</label>
                                      <Textarea
                                        value={moderationNotes}
                                        onChange={(e) => setModerationNotes(e.target.value)}
                                        placeholder="Adaugă note..."
                                        className="mt-1"
                                      />
                                    </div>
                                  )}
                                </div>
                                {group.moderation_status === "pending" && (
                                  <DialogFooter className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleModerate("rejected")}
                                      disabled={actionLoading === group.id}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Respinge
                                    </Button>
                                    <Button
                                      onClick={() => handleModerate("approved")}
                                      disabled={actionLoading === group.id}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Aprobă
                                    </Button>
                                  </DialogFooter>
                                )}
                              </DialogContent>
                            </Dialog>
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(group)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
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
