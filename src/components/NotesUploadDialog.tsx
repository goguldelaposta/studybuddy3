import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Upload, Loader2, FileUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function NotesUploadDialog({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        faculty: "",
        year: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !user) return;
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
            // 1. Upload File to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('notes-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('notes-files')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('notes')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    subject: formData.subject,
                    faculty: formData.faculty,
                    year: formData.year ? parseInt(formData.year) : null,
                    file_url: publicUrl,
                    user_id: user.id
                });

            if (dbError) throw dbError;

            toast({
                title: "Succes!",
                description: "Notițele au fost încărcate.",
            });

            setOpen(false);
            setFormData({ title: "", description: "", subject: "", faculty: "", year: "" });
            setFile(null);
            onUploadComplete();

        } catch (error: any) {
            toast({
                title: "Eroare",
                description: error.message || "A apărut o eroare la upload.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Curs
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Încarcă Materiale</DialogTitle>
                    <DialogDescription>
                        Ajută-ți colegii cu notițe, cursuri sau seminarii.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Titlu *</Label>
                        <Input
                            id="title"
                            placeholder="ex: Curs 1 - Analiză Matematică"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Materie *</Label>
                        <Input
                            id="subject"
                            placeholder="ex: Matematică"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="faculty">Facultate</Label>
                            <Input
                                id="faculty"
                                placeholder="ex: Automatică"
                                value={formData.faculty}
                                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="year">An Studiu</Label>
                            <Input
                                id="year"
                                type="number"
                                placeholder="ex: 1"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descriere</Label>
                        <Textarea
                            id="description"
                            placeholder="Scurtă descriere a conținutului..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="file">Fișier (PDF, DOCX, JPG) *</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Anulează
                    </Button>
                    <Button onClick={handleUpload} disabled={loading || !file}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                        Încarcă
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
