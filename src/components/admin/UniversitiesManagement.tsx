import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Loader2, Plus, Edit, Trash2, Save, Building2 } from "lucide-react";

interface University {
  id: string;
  name: string;
  short_name: string;
  city: string;
  website: string | null;
  created_at: string;
}

export const UniversitiesManagement = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    city: "",
    website: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedUniversity(null);
    setFormData({ name: "", short_name: "", city: "", website: "" });
    setShowDialog(true);
  };

  const handleEdit = (university: University) => {
    setSelectedUniversity(university);
    setFormData({
      name: university.name,
      short_name: university.short_name,
      city: university.city,
      website: university.website || "",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.short_name || !formData.city) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Completează toate câmpurile obligatorii.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      if (selectedUniversity) {
        // Update
        const { error } = await supabase
          .from("universities")
          .update({
            name: formData.name,
            short_name: formData.short_name,
            city: formData.city,
            website: formData.website || null,
          })
          .eq("id", selectedUniversity.id);

        if (error) throw error;
        toast({ title: "Universitate actualizată", description: "Modificările au fost salvate." });
      } else {
        // Insert
        const { error } = await supabase.from("universities").insert({
          name: formData.name,
          short_name: formData.short_name,
          city: formData.city,
          website: formData.website || null,
        });

        if (error) throw error;
        toast({ title: "Universitate adăugată", description: "Universitatea a fost adăugată cu succes." });
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
    if (!selectedUniversity || !isAdmin) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("universities")
        .delete()
        .eq("id", selectedUniversity.id);

      if (error) throw error;
      toast({ title: "Universitate ștearsă", description: "Universitatea a fost ștearsă." });
      setShowDeleteDialog(false);
      setSelectedUniversity(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Eroare la ștergere", description: error.message, variant: "destructive" });
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
                <Building2 className="w-5 h-5" />
                Gestionare Universități
              </CardTitle>
              <CardDescription>Adaugă, editează sau șterge universități</CardDescription>
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Prescurtare</TableHead>
                  <TableHead>Oraș</TableHead>
                  <TableHead>Website</TableHead>
                  {isAdmin && <TableHead className="text-right">Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((uni) => (
                  <TableRow key={uni.id}>
                    <TableCell className="font-medium">{uni.name}</TableCell>
                    <TableCell>{uni.short_name}</TableCell>
                    <TableCell>{uni.city}</TableCell>
                    <TableCell>
                      {uni.website ? (
                        <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {uni.website}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(uni)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUniversity(uni);
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
                {universities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nicio universitate adăugată
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
            <DialogTitle>{selectedUniversity ? "Editare Universitate" : "Adaugă Universitate"}</DialogTitle>
            <DialogDescription>
              {selectedUniversity ? "Modifică informațiile universității" : "Completează datele noii universități"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nume complet *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Universitatea din București"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prescurtare *</label>
              <Input
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="UB"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Oraș *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="București"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://unibuc.ro"
                className="mt-1"
              />
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
              Această acțiune va șterge permanent universitatea <strong>{selectedUniversity?.name}</strong>.
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
