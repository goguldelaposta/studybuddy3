import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AddExamDialog } from "@/components/AddExamDialog";
import { EditExamDialog } from "@/components/EditExamDialog";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { MapPin, Clock, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Exam {
    id: string;
    subject: string;
    exam_date: string;
    location: string;
    faculty: string;
    created_by: string;
}

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [editExam, setEditExam] = useState<Exam | null>(null);
    const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
    const { user, signOut } = useAuth();
    const { profiles } = useProfiles();
    const navigate = useNavigate();
    const { toast } = useToast();

    const currentProfile = profiles.find(p => p.user_id === user?.id);

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const fetchExams = async () => {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*')
                .order('exam_date', { ascending: true });

            if (error) throw error;
            setExams(data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDeleteExam = async () => {
        if (!deleteExamId) return;

        try {
            const { error } = await supabase
                .from('exams')
                .delete()
                .eq('id', deleteExamId);

            if (error) throw error;

            toast({
                title: "Șters!",
                description: "Examenul a fost șters cu succes.",
            });

            fetchExams();
        } catch (error: any) {
            toast({
                title: "Eroare",
                description: error.message || "Nu s-a putut șterge examenul.",
                variant: "destructive",
            });
        } finally {
            setDeleteExamId(null);
        }
    };

    // Filter exams for selected date
    const selectedDateExams = exams.filter(exam =>
        date && isSameDay(new Date(exam.exam_date), date)
    );

    // Get days with exams for modifiers
    const daysWithExams = exams.map(exam => new Date(exam.exam_date));

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                isAuthenticated={!!user}
                user={user ? { email: user.email || "", fullName: currentProfile?.full_name, avatarUrl: currentProfile?.avatar_url || undefined } : null}
                onSignOut={handleSignOut}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Calendar Sesiune
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Organizează-ți sesiunea și vezi când au examene colegii tăi.
                        </p>
                    </div>
                    <AddExamDialog onExamAdded={fetchExams} />
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
                    {/* Calendar and Upcoming List */}
                    <div className="space-y-6">
                        <Card className="border-2 border-primary/10">
                            <CardContent className="p-6">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    locale={ro}
                                    className="rounded-md border mx-auto w-fit pointer-events-auto"
                                    modifiers={{
                                        examen: daysWithExams
                                    }}
                                    modifiersStyles={{
                                        examen: {
                                            fontWeight: 'bold',
                                            color: 'var(--primary)',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Următoarele Examene (Tot anul)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {exams.slice(0, 5).map(exam => (
                                        <div key={exam.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                                            <div>
                                                <div className="font-semibold">{exam.subject}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format(new Date(exam.exam_date), "PPP", { locale: ro })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                                    {exam.faculty}
                                                </div>
                                                {user?.id === exam.created_by && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setEditExam(exam)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => setDeleteExamId(exam.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {exams.length === 0 && <p className="text-muted-foreground">Niciun examen programat.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selected Date Details */}
                    <div className="space-y-6">
                        <Card className="h-full border-l-4 border-l-primary shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    {date ? format(date, "PPPP", { locale: ro }) : "Selectează o dată"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {selectedDateExams.length > 0 ? (
                                        selectedDateExams.map(exam => (
                                            <div key={exam.id} className="p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow group relative">
                                                {/* Edit/Delete for owner */}
                                                {user?.id === exam.created_by && (
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setEditExam(exam)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => setDeleteExamId(exam.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}

                                                <h3 className="font-bold text-lg text-primary mb-1">{exam.subject}</h3>
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {exam.location || "Locație nespecificată"}
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                                                        {exam.faculty}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <p>Niciun examen în această zi.</p>
                                            <p className="text-sm mt-2 opacity-70">Relaxează-te sau învață pentru următorul! ☕</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <EditExamDialog
                exam={editExam}
                open={!!editExam}
                onOpenChange={(open) => !open && setEditExam(null)}
                onExamUpdated={fetchExams}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteExamId} onOpenChange={(open) => !open && setDeleteExamId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Această acțiune nu poate fi anulată. Examenul va fi șters definitiv.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Șterge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}