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
import { useState } from "react";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AddExamDialog({ onExamAdded }: { onExamAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        subject: "",
        location: "",
        faculty: "",
        year: "",
    });
    const [date, setDate] = useState<Date>();

    const handleSubmit = async () => {
        if (!user || !date || !formData.subject || !formData.faculty) {
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
                .insert({
                    subject: formData.subject,
                    location: formData.location,
                    faculty: formData.faculty,
                    year: formData.year ? parseInt(formData.year) : null,
                    exam_date: date.toISOString(),
                    created_by: user.id
                });

            if (error) throw error;

            toast({
                title: "Succes!",
                description: "Examenul a fost adăugat în calendar.",
            });

            setOpen(false);
            setFormData({ subject: "", location: "", faculty: "", year: "" });
            setDate(undefined);
            onExamAdded();

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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Adaugă Examen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Programare Examen</DialogTitle>
                    <DialogDescription>
                        Adaugă un examen în calendarul comun al facultății.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Materie *</Label>
                        <Input
                            id="subject"
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
                        <Label htmlFor="location">Sală / Locație</Label>
                        <Input
                            id="location"
                            placeholder="ex: Sala EC105"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="faculty">Facultate *</Label>
                            <Input
                                id="faculty"
                                placeholder="ex: ETTI"
                                value={formData.faculty}
                                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="year">An</Label>
                            <Input
                                id="year"
                                type="number"
                                placeholder="ex: 2"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvează
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
