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
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Exam {
    id: string;
    subject: string;
    exam_date: string;
    location: string;
    faculty: string;
}

interface EditExamDialogProps {
    exam: Exam | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExamUpdated: () => void;
}

export function EditExamDialog({ exam, open, onOpenChange, onExamUpdated }: EditExamDialogProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        subject: "",
        location: "",
        faculty: "",
    });
    const [date, setDate] = useState<Date>();

    useEffect(() => {
        if (exam) {
            setFormData({
                subject: exam.subject || "",
                location: exam.location || "",
                faculty: exam.faculty || "",
            });
            setDate(new Date(exam.exam_date));
        }
    }, [exam]);

    const handleUpdate = async () => {
        if (!exam || !date || !formData.subject || !formData.faculty) {
            toast({
                title: "Lipsesc informații",
                description: "Te rog completează materia, facultatea și data.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('exams')
                .update({
                    subject: formData.subject,
                    location: formData.location,
                    faculty: formData.faculty,
                    exam_date: date.toISOString(),
                })
                .eq('id', exam.id);

            if (error) throw error;

            toast({
                title: "Succes!",
                description: "Examenul a fost actualizat.",
            });

            onOpenChange(false);
            onExamUpdated();

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editează Examen</DialogTitle>
                    <DialogDescription>
                        Modifică detaliile examenului.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-subject">Materie *</Label>
                        <Input
                            id="edit-subject"
                            placeholder="ex: Structuri de Date"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Data și Ora *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Alege data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-location">Sală / Locație</Label>
                        <Input
                            id="edit-location"
                            placeholder="ex: Sala EC105"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-faculty">Facultate *</Label>
                        <Input
                            id="edit-faculty"
                            placeholder="ex: ETTI"
                            value={formData.faculty}
                            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
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