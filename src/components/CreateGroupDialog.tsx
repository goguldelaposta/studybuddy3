import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreateGroupData } from "@/hooks/useGroups";
import { triggerHaptic } from "@/hooks/useHapticFeedback";

interface CreateGroupDialogProps {
  onCreateGroup: (data: CreateGroupData) => Promise<string | null>;
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

interface Subject {
  id: string;
  name: string;
  faculty: string;
}

export function CreateGroupDialog({ onCreateGroup }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Catalogs
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [universityId, setUniversityId] = useState<string>("");
  const [facultyId, setFacultyId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [isPublic, setIsPublic] = useState(true);
  const [maxMembers, setMaxMembers] = useState(20);

  // 1. Fetch Universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data } = await supabase.from("universities").select("*").order("name");
      if (data) setUniversities(data);
    };
    fetchUniversities();
  }, []);

  // 2. Fetch Faculties when University changes
  useEffect(() => {
    if (!universityId) {
      setFaculties([]);
      return;
    }
    const fetchFaculties = async () => {
      const { data } = await supabase
        .from("faculties")
        .select("*")
        .eq("university_id", universityId)
        .order("name");
      if (data) setFaculties(data);
    };
    fetchFaculties();
    setFacultyId("");
    setCourseId("");
  }, [universityId]);

  // 3. Fetch Courses when Faculty changes
  useEffect(() => {
    if (!facultyId) {
      setCourses([]);
      return;
    }
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("faculty_id", facultyId)
        .order("name");
      if (data) setCourses(data);
    };
    fetchCourses();
    setCourseId("");
  }, [facultyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const result = await onCreateGroup({
      name: name.trim(),
      description: description.trim() || undefined,
      university_id: universityId || undefined,
      subject_id: courseId || undefined, // We pass course_id as subject_id to reuse the interface for now
      is_public: isPublic,
      max_members: maxMembers,
    });

    setLoading(false);

    if (result) {
      // Reset form
      setName("");
      setDescription("");
      setUniversityId("");
      setFacultyId("");
      setCourseId("");
      setIsPublic(true);
      setMaxMembers(20);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="gradient-primary text-primary-foreground gap-2 min-h-[44px]"
          onClick={() => triggerHaptic('light')}
        >
          <Plus className="h-4 w-4" />
          Creează Grup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Creează un grup de studiu</DialogTitle>
            <DialogDescription>
              Creează un grup pentru a colabora cu alți studenți.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Numele grupului *</Label>
              <Input
                id="name"
                placeholder="ex: Pregătire Examen Algebra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                placeholder="Descrie scopul grupului..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* University */}
              <div className="grid gap-2">
                <Label htmlFor="university">Universitate</Label>
                <Select value={universityId} onValueChange={setUniversityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează Universitatea..." />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.short_name} - {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Faculty */}
              <div className="grid gap-2">
                <Label htmlFor="faculty">Facultate</Label>
                <Select value={facultyId} onValueChange={setFacultyId} disabled={!universityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează Facultatea..." />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((fac) => (
                      <SelectItem key={fac.id} value={fac.id}>
                        {fac.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div className="grid gap-2">
                <Label htmlFor="course">Materie / Curs</Label>
                <Select value={courseId} onValueChange={setCourseId} disabled={!facultyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează Materia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} (An {course.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxMembers">Nr. maxim de membri</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min={2}
                  max={100}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value) || 20)}
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Grup public
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="min-h-[44px]"
            >
              Anulează
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground min-h-[44px]"
              disabled={loading || !name.trim()}
              onClick={() => triggerHaptic('success')}
            >
              {loading ? "Se creează..." : "Creează Grup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
