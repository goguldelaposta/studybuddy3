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
  Megaphone, Search, Loader2, Eye, CheckCircle, XCircle, 
  Clock, Trash2, ExternalLink
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: string;
  created_at: string;
  moderation_status: string;
  moderation_notes: string | null;
  user?: {
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

export const ContentModeration = () => {
  const { moderateContent, deleteContent } = useModeration();
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, description, category, user_id, created_at, moderation_status, moderation_notes")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const announcementsWithUsers = await Promise.all(
        (data || []).map(async (announcement: any) => {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", announcement.user_id)
            .single();

          return {
            ...announcement,
            user: userProfile,
          };
        })
      );

      setAnnouncements(announcementsWithUsers);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleModerate = async (status: "approved" | "rejected") => {
    if (!selectedAnnouncement) return;

    setActionLoading(selectedAnnouncement.id);
    const result = await moderateContent("announcements", selectedAnnouncement.id, status, moderationNotes);
    
    if (result.success) {
      toast({
        title: status === "approved" ? "Anunț aprobat" : "Anunț respins",
        description: `Anunțul "${selectedAnnouncement.title}" a fost ${status === "approved" ? "aprobat" : "respins"}.`,
      });
      setSelectedAnnouncement(null);
      setModerationNotes("");
      fetchAnnouncements();
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut modera anunțul.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!isAdmin) {
      toast({
        title: "Acces interzis",
        description: "Doar administratorii pot șterge anunțuri.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(announcement.id);
    const result = await deleteContent("announcements", announcement.id);
    
    if (result.success) {
      toast({
        title: "Anunț șters",
        description: `Anunțul "${announcement.title}" a fost șters permanent.`,
      });
      fetchAnnouncements();
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut șterge anunțul.",
        variant: "destructive",
      });
    }
    setActionLoading(null);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || a.moderation_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = announcements.filter((a) => a.moderation_status === "pending").length;

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
          <Megaphone className="w-5 h-5" />
          Moderare Anunțuri
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
              {pendingCount} în așteptare
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Aprobă sau respinge anunțurile utilizatorilor
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută anunțuri..."
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

        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nu există anunțuri</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titlu</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{announcement.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {announcement.user?.full_name || "Necunoscut"}
                    </TableCell>
                    <TableCell>{getStatusBadge(announcement.moderation_status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(announcement.created_at).toLocaleDateString("ro-RO")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {actionLoading === announcement.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedAnnouncement(announcement)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>{announcement.title}</DialogTitle>
                                  <DialogDescription>
                                    Postat de {announcement.user?.full_name} în {announcement.category}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Descriere</p>
                                    <p className="text-sm">{announcement.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    {getStatusBadge(announcement.moderation_status)}
                                  </div>
                                  {announcement.moderation_status === "pending" && (
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
                                {announcement.moderation_status === "pending" && (
                                  <DialogFooter className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleModerate("rejected")}
                                      disabled={actionLoading === announcement.id}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Respinge
                                    </Button>
                                    <Button
                                      onClick={() => handleModerate("approved")}
                                      disabled={actionLoading === announcement.id}
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
                                onClick={() => handleDelete(announcement)}
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
