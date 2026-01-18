import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Note {
    id: string;
    title: string;
    description: string;
    subject: string;
    faculty: string;
    downloads: number;
}

interface EditNoteDialogProps {
    note: Note | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNoteUpdated: () => void;
}

export function EditNoteDialog({ note, open, onOpenChange, onNoteUpdated }: EditNoteDialogProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        faculty: "",
    });

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.title || "",
                description: note.description || "",
                subject: note.subject || "",
                faculty: note.faculty || "",
            });
        }
    }, [note]);

    const handleUpdate = async () => {
        if (!note) return;
        if (!formData.title || !formData.subject) {
            toast({
                title: "Lipsesc informații",
                description: "Te rog completează titlul și materia.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('notes')
                .update({
                    title: formData.title,
                    description: formData.description,
                    subject: formData.subject,
                    faculty: formData.faculty,
                })
                .eq('id', note.id);

            if (error) throw error;

            toast({
                title: "Succes!",
                description: "Notița a fost actualizată.",
            });

            onOpenChange(false);
            onNoteUpdated();

        } catch (error: any) {
            toast({
                title: "Eroare",
                description: error.message || "A apărut o eroare.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editează Notiță</DialogTitle>
                    <DialogDescription>
                        Modifică detaliile notiței tale.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-title">Titlu *</Label>
                        <Input
                            id="edit-title"
                            placeholder="ex: Curs 1 - Analiză Matematică"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-subject">Materie *</Label>
                        <Input
                            id="edit-subject"
                            placeholder="ex: Matematică"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-faculty">Facultate</Label>
                        <Input
                            id="edit-faculty"
                            placeholder="ex: Automatică"
                            value={formData.faculty}
                            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Descriere</Label>
                        <Textarea
                            id="edit-description"
                            placeholder="Scurtă descriere a conținutului..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Anulează
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvează
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}