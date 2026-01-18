import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotesUploadDialog } from "@/components/NotesUploadDialog";
import { EditNoteDialog } from "@/components/EditNoteDialog";
import { NotesFilters } from "@/components/NotesFilters";
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

interface Note {
    id: string;
    title: string;
    description: string;
    subject: string;
    faculty: string;
    downloads: number;
    user_id: string;
    file_url: string | null;
}

export default function Notes() {
    const [searchTerm, setSearchTerm] = useState("");
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [editNote, setEditNote] = useState<Note | null>(null);
    const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const { user, signOut } = useAuth();
    const { profiles } = useProfiles();
    const navigate = useNavigate();
    const { toast } = useToast();

    const currentProfile = profiles.find(p => p.user_id === user?.id);

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async () => {
        if (!deleteNoteId) return;

        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', deleteNoteId);

            if (error) throw error;

            toast({
                title: "Șters!",
                description: "Notița a fost ștearsă cu succes.",
            });

            fetchNotes();
        } catch (error: any) {
            toast({
                title: "Eroare",
                description: error.message || "Nu s-a putut șterge notița.",
                variant: "destructive",
            });
        } finally {
            setDeleteNoteId(null);
        }
    };

    const handleDownload = async (note: Note) => {
        if (!note.file_url) {
            toast({
                title: "Eroare",
                description: "Acest fișier nu are o adresă de descărcare.",
                variant: "destructive",
            });
            return;
        }

        setDownloadingId(note.id);

        try {
            // Extract filename from URL or use title
            const urlParts = note.file_url.split('/');
            const originalFileName = urlParts[urlParts.length - 1] || `${note.title}.pdf`;
            const fileName = decodeURIComponent(originalFileName);
            
            // Open file in new tab - this forces download for most file types
            const link = document.createElement('a');
            link.href = note.file_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Increment download counter in database
            const { error } = await supabase
                .from('notes')
                .update({ downloads: note.downloads + 1 })
                .eq('id', note.id);

            if (error) {
                console.error('Error updating download count:', error);
            } else {
                // Update local state
                setNotes(prev => prev.map(n => 
                    n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
                ));
            }

            toast({
                title: "Succes!",
                description: "Fișierul se descarcă...",
            });
        } catch (error: any) {
            console.error('Download error:', error);
            toast({
                title: "Eroare",
                description: error.message || "Nu s-a putut descărca fișierul.",
                variant: "destructive",
            });
        } finally {
            setDownloadingId(null);
        }
    };

    // Get unique faculties and subjects for filters
    const { faculties, subjects } = useMemo(() => {
        const facultySet = new Set<string>();
        const subjectSet = new Set<string>();
        
        notes.forEach(note => {
            if (note.faculty) facultySet.add(note.faculty);
            if (note.subject) subjectSet.add(note.subject);
        });

        return {
            faculties: Array.from(facultySet).sort(),
            subjects: Array.from(subjectSet).sort(),
        };
    }, [notes]);

    // Filter notes
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch = 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.subject.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFaculty = !selectedFaculty || selectedFaculty === "all" || note.faculty === selectedFaculty;
            const matchesSubject = !selectedSubject || selectedSubject === "all" || note.subject === selectedSubject;

            return matchesSearch && matchesFaculty && matchesSubject;
        });
    }, [notes, searchTerm, selectedFaculty, selectedSubject]);

    const handleClearFilters = () => {
        setSelectedFaculty("");
        setSelectedSubject("");
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                isAuthenticated={!!user}
                user={user ? { email: user.email || "", fullName: currentProfile?.full_name, avatarUrl: currentProfile?.avatar_url || undefined } : null}
                onSignOut={handleSignOut}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Bursa de Notițe
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Descarcă cursurile de care ai nevoie sau ajută-ți colegii.
                        </p>
                    </div>
                    <NotesUploadDialog onUploadComplete={fetchNotes} />
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex gap-4 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Caută după materie sau titlu..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <NotesFilters
                            faculties={faculties}
                            subjects={subjects}
                            selectedFaculty={selectedFaculty}
                            selectedSubject={selectedSubject}
                            onFacultyChange={setSelectedFaculty}
                            onSubjectChange={setSelectedSubject}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                </div>

                {/* Notes Grid */}
                {loading ? (
                    <div className="text-center py-20">Se încarcă...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredNotes.map((note) => (
                            <Card key={note.id} className="hover:shadow-lg transition-shadow relative group">
                                {/* Edit/Delete buttons for owner */}
                                {user?.id === note.user_id && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-background/80 hover:bg-background"
                                            onClick={() => setEditNote(note)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => setDeleteNoteId(note.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
                                        {note.subject}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-xl mb-2">{note.title}</CardTitle>
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                        {note.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <span className="text-sm text-muted-foreground">
                                            {note.faculty}
                                        </span>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="gap-2"
                                            onClick={() => handleDownload(note)}
                                            disabled={downloadingId === note.id || !note.file_url}
                                        >
                                            {downloadingId === note.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                            {note.downloads}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredNotes.length === 0 && (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                Nu am găsit notițe. Fii primul care încarcă!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <EditNoteDialog
                note={editNote}
                open={!!editNote}
                onOpenChange={(open) => !open && setEditNote(null)}
                onNoteUpdated={fetchNotes}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteNoteId} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Această acțiune nu poate fi anulată. Notița va fi ștearsă definitiv.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Șterge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
