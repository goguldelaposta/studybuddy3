import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Loader2, Plus, Edit, Trash2, Save, BookOpen, Search } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string | null;
  faculty: string;
  university_id: string | null;
  university?: { name: string; short_name: string };
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

export const SubjectsManagement = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    faculty: "",
    university_id: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [{ data: subjectsData }, { data: unisData }] = await Promise.all([
        supabase.from("subjects").select("*, university:universities(name, short_name)").order("name", { ascending: true }),
        supabase.from("universities").select("id, name, short_name"),
      ]);

      setSubjects(subjectsData || []);
      setUniversities(unisData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setSelectedSubject(null);
    setFormData({ name: "", code: "", faculty: "", university_id: "" });
    setShowDialog(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || "",
      faculty: subject.faculty,
      university_id: subject.university_id || "",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.faculty) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Completează numele și facultatea.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      if (selectedSubject) {
        const { error } = await supabase
          .from("subjects")
          .update({
            name: formData.name,
            code: formData.code || null,
            faculty: formData.faculty,
            university_id: formData.university_id || null,
          })
          .eq("id", selectedSubject.id);

        if (error) throw error;
        toast({ title: "Materie actualizată", description: "Modificările au fost salvate." });
      } else {
        const { error } = await supabase.from("subjects").insert({
          name: formData.name,
          code: formData.code || null,
          faculty: formData.faculty,
          university_id: formData.university_id || null,
        });

        if (error) throw error;
        toast({ title: "Materie adăugată", description: "Materia a fost adăugată cu succes." });
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
    if (!selectedSubject || !isAdmin) return;
    setActionLoading(true);

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", selectedSubject.id);
      if (error) throw error;
      toast({ title: "Materie ștearsă", description: "Materia a fost ștearsă." });
      setShowDeleteDialog(false);
      setSelectedSubject(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Eroare la ștergere", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Gestionare Materii
              </CardTitle>
              <CardDescription>Adaugă, editează sau șterge materii</CardDescription>
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
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Caută după nume, cod sau facultate..."
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
                  <TableHead>Nume</TableHead>
                  <TableHead>Cod</TableHead>
                  <TableHead>Facultate</TableHead>
                  <TableHead>Universitate</TableHead>
                  {isAdmin && <TableHead className="text-right">Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code || "-"}</TableCell>
                    <TableCell>{subject.faculty}</TableCell>
                    <TableCell>{subject.university?.short_name || "-"}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(subject)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSubject(subject);
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
                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "Nicio materie găsită" : "Nicio materie adăugată"}
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
            <DialogTitle>{selectedSubject ? "Editare Materie" : "Adaugă Materie"}</DialogTitle>
            <DialogDescription>
              {selectedSubject ? "Modifică informațiile materiei" : "Completează datele noii materii"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nume *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Programare Orientată pe Obiecte"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cod</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="POO"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Facultate *</label>
              <Input
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                placeholder="Facultatea de Informatică"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Universitate</label>
              <Select
                value={formData.university_id}
                onValueChange={(value) => setFormData({ ...formData, university_id: value })}
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
              Această acțiune va șterge permanent materia <strong>{selectedSubject?.name}</strong>.
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
