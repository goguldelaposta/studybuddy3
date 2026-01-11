import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Loader2, Plus, Edit, Trash2, Save, Lightbulb, Search } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
}

const SKILL_CATEGORIES = [
  { value: "programming", label: "Programare", color: "bg-blue-500/10 text-blue-600" },
  { value: "design", label: "Design", color: "bg-purple-500/10 text-purple-600" },
  { value: "languages", label: "Limbi străine", color: "bg-green-500/10 text-green-600" },
  { value: "soft_skills", label: "Soft skills", color: "bg-amber-500/10 text-amber-600" },
  { value: "business", label: "Business", color: "bg-red-500/10 text-red-600" },
  { value: "other", label: "Altele", color: "bg-gray-500/10 text-gray-600" },
];

const getCategoryBadge = (category: string) => {
  const cat = SKILL_CATEGORIES.find((c) => c.value === category);
  return cat ? (
    <Badge className={cat.color}>{cat.label}</Badge>
  ) : (
    <Badge variant="secondary">{category}</Badge>
  );
};

export const SkillsManagement = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedSkill(null);
    setFormData({ name: "", category: "other" });
    setShowDialog(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: "Câmp obligatoriu",
        description: "Completează numele skill-ului.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      if (selectedSkill) {
        const { error } = await supabase
          .from("skills")
          .update({
            name: formData.name,
            category: formData.category,
          })
          .eq("id", selectedSkill.id);

        if (error) throw error;
        toast({ title: "Skill actualizat", description: "Modificările au fost salvate." });
      } else {
        const { error } = await supabase.from("skills").insert({
          name: formData.name,
          category: formData.category,
        });

        if (error) throw error;
        toast({ title: "Skill adăugat", description: "Skill-ul a fost adăugat cu succes." });
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSkill || !isAdmin) return;
    setActionLoading(true);

    try {
      const { error } = await supabase.from("skills").delete().eq("id", selectedSkill.id);
      if (error) throw error;
      toast({ title: "Skill șters", description: "Skill-ul a fost șters." });
      setShowDeleteDialog(false);
      setSelectedSkill(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Eroare la ștergere", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
                <Lightbulb className="w-5 h-5" />
                Gestionare Skills
              </CardTitle>
              <CardDescription>Adaugă, editează sau șterge competențe</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Adaugă
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Caută după nume..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate categoriile</SelectItem>
                {SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Categorie</TableHead>
                  {isAdmin && <TableHead className="text-right">Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{getCategoryBadge(skill.category)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(skill)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSkill(skill);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredSkills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      {searchQuery || categoryFilter !== "all" ? "Niciun skill găsit" : "Niciun skill adăugat"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSkill ? "Editare Skill" : "Adaugă Skill"}</DialogTitle>
            <DialogDescription>
              {selectedSkill ? "Modifică informațiile skill-ului" : "Completează datele noului skill"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nume *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="JavaScript, Python, etc."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categorie</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleSave} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Salvează</>}
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
              Această acțiune va șterge permanent skill-ul <strong>{selectedSkill?.name}</strong>.
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
