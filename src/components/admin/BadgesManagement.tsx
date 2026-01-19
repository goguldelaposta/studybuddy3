import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Save, X, Award, Zap, Hand } from "lucide-react";
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
  points_required: number | null;
  created_at: string;
}

const iconOptions = [
  { value: "crown", label: "👑 Coroană" },
  { value: "shield-check", label: "🛡️ Scut" },
  { value: "user-check", label: "✓ Verificat" },
  { value: "book-open", label: "📚 Carte" },
  { value: "flame", label: "🔥 Flacără" },
  { value: "award", label: "🏆 Trofeu" },
  { value: "rocket", label: "🚀 Rachetă" },
  { value: "star", label: "⭐ Stea" },
  { value: "users", label: "👥 Utilizatori" },
  { value: "message-circle", label: "💬 Mesaj" },
  { value: "megaphone", label: "📢 Megafon" },
  { value: "handshake", label: "🤝 Strângere de mână" },
];

const colorOptions = [
  { value: "gold", label: "Auriu", class: "bg-yellow-100 text-yellow-700" },
  { value: "blue", label: "Albastru", class: "bg-blue-100 text-blue-700" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-100 text-cyan-700" },
  { value: "green", label: "Verde", class: "bg-green-100 text-green-700" },
  { value: "orange", label: "Portocaliu", class: "bg-orange-100 text-orange-700" },
  { value: "purple", label: "Mov", class: "bg-purple-100 text-purple-700" },
  { value: "pink", label: "Roz", class: "bg-pink-100 text-pink-700" },
  { value: "emerald", label: "Smarald", class: "bg-emerald-100 text-emerald-700" },
  { value: "amber", label: "Chihlimbar", class: "bg-amber-100 text-amber-700" },
  { value: "violet", label: "Violet", class: "bg-violet-100 text-violet-700" },
];

const categoryOptions = [
  { value: "special", label: "Speciale" },
  { value: "milestone", label: "Etape importante" },
  { value: "contribution", label: "Contribuții" },
  { value: "social", label: "Social" },
  { value: "achievement", label: "Realizări" },
  { value: "leadership", label: "Leadership" },
];

const automaticCriteriaOptions = [
  { value: "none", label: "Fără (Manual)" },
  { value: "email_verified", label: "Email verificat" },
  { value: "notes_count_10", label: ">10 notițe încărcate" },
  { value: "account_age_30", label: ">30 zile vechime" },
];

export const BadgesManagement = () => {
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<BadgeType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeType | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "award",
    color: "blue",
    category: "achievement",
    is_manual: true,
    automatic_criteria: "none",
  });

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "award",
      color: "blue",
      category: "achievement",
      is_manual: true,
      automatic_criteria: "none",
    });
    setEditingBadge(null);
  };

  const handleOpenDialog = (badge?: BadgeType) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category,
        is_manual: badge.is_manual,
        automatic_criteria: badge.automatic_criteria || "none",
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Date incomplete",
        description: "Completează numele și descrierea insignei.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const badgeData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        category: formData.category,
        is_manual: formData.automatic_criteria === "none",
        automatic_criteria: formData.automatic_criteria === "none" ? null : formData.automatic_criteria,
      };

      if (editingBadge) {
        const { error } = await supabase
          .from("badges")
          .update(badgeData)
          .eq("id", editingBadge.id);

        if (error) throw error;
        toast({ title: "Insignă actualizată", description: "Insigna a fost actualizată cu succes." });
      } else {
        const { error } = await supabase
          .from("badges")
          .insert(badgeData);

        if (error) throw error;
        toast({ title: "Insignă creată", description: "Noua insignă a fost creată cu succes." });
      }

      setShowDialog(false);
      resetForm();
      fetchBadges();
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

  const handleDelete = async () => {
    if (!badgeToDelete) return;
    setActionLoading(true);

    try {
      // First delete all user_badges for this badge
      await supabase
        .from("user_badges")
        .delete()
        .eq("badge_id", badgeToDelete.id);

      // Then delete the badge
      const { error } = await supabase
        .from("badges")
        .delete()
        .eq("id", badgeToDelete.id);

      if (error) throw error;

      toast({ title: "Insignă ștearsă", description: "Insigna a fost ștearsă cu succes." });
      setShowDeleteDialog(false);
      setBadgeToDelete(null);
      fetchBadges();
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Gestionare Insigne
              </CardTitle>
              <CardDescription>Creează, editează și șterge tipurile de insigne</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Insignă nouă
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insignă</TableHead>
                  <TableHead>Descriere</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Criteriu Automat</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges.map((badge) => (
                  <TableRow key={badge.id}>
                    <TableCell>
                      <ProfileBadge
                        name={badge.name}
                        description={badge.description}
                        icon={badge.icon}
                        color={badge.color}
                        size="md"
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {badge.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {categoryOptions.find(c => c.value === badge.category)?.label || badge.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {badge.is_manual ? (
                        <Badge variant="secondary" className="gap-1">
                          <Hand className="w-3 h-3" />
                          Manual
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                          <Zap className="w-3 h-3" />
                          Automat
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {automaticCriteriaOptions.find(c => c.value === badge.automatic_criteria)?.label || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(badge)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setBadgeToDelete(badge);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {badges.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nu există insigne. Creează prima insignă!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBadge ? "Editare Insignă" : "Insignă Nouă"}</DialogTitle>
            <DialogDescription>
              {editingBadge ? "Modifică detaliile insignei" : "Creează o nouă insignă pentru platformă"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nume</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Top Contribuitor"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descriere</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrierea insignei..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Icon</label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Culoare</label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${color.class.split(" ")[0]}`} />
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Categorie</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Criteriu Automat</label>
              <Select 
                value={formData.automatic_criteria} 
                onValueChange={(value) => setFormData({ ...formData, automatic_criteria: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selectează criteriul" />
                </SelectTrigger>
                <SelectContent>
                  {automaticCriteriaOptions.map((criteria) => (
                    <SelectItem key={criteria.value} value={criteria.value}>
                      {criteria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Insignele automate sunt acordate automat când utilizatorul îndeplinește criteriul.
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Previzualizare:</p>
              <ProfileBadge
                name={formData.name || "Numele Insignei"}
                description={formData.description || "Descriere"}
                icon={formData.icon}
                color={formData.color}
                size="lg"
                showTooltip={false}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Anulează
            </Button>
            <Button onClick={handleSave} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingBadge ? "Salvează" : "Creează"}
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
            <AlertDialogTitle>Șterge insigna?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va șterge permanent insigna <strong>{badgeToDelete?.name}</strong> și va revoca această insignă de la toți utilizatorii care o dețin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
