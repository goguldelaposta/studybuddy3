import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, GraduationCap, Sparkles, BookOpen, Save, X, Building } from "lucide-react";

interface University {
  id: string;
  name: string;
  short_name: string;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileData) => void;
  initialData?: Partial<ProfileData>;
  availableSkills: { id: string; name: string }[];
  availableSubjects: { id: string; name: string; faculty: string; university_id: string | null }[];
  universities: University[];
  faculties: string[];
  isLoading?: boolean;
}

export interface ProfileData {
  fullName: string;
  faculty: string;
  yearOfStudy: number;
  bio: string;
  lookingFor: string;
  skills: string[];
  subjects: string[];
  universityId?: string;
}

export const ProfileForm = ({
  onSubmit,
  initialData,
  availableSkills,
  availableSubjects,
  universities,
  faculties,
  isLoading = false,
}: ProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileData>({
    fullName: initialData?.fullName || "",
    faculty: initialData?.faculty || "",
    yearOfStudy: initialData?.yearOfStudy || 1,
    bio: initialData?.bio || "",
    lookingFor: initialData?.lookingFor || "teammates",
    skills: initialData?.skills || [],
    subjects: initialData?.subjects || [],
    universityId: initialData?.universityId || "",
  });

  // Sync form data when initialData changes (e.g., when profile is loaded async)
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        faculty: initialData.faculty || "",
        yearOfStudy: initialData.yearOfStudy || 1,
        bio: initialData.bio || "",
        lookingFor: initialData.lookingFor || "teammates",
        skills: initialData.skills || [],
        subjects: initialData.subjects || [],
        universityId: initialData.universityId || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  // Filter subjects by selected university
  const filteredSubjects = formData.universityId
    ? availableSubjects.filter((s) => s.university_id === formData.universityId)
    : availableSubjects;

  // Get unique faculties from filtered subjects
  const availableFaculties = [...new Set(filteredSubjects.map((s) => s.faculty))];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <User className="w-5 h-5 text-primary" />
            Informații de Bază
          </CardTitle>
          <CardDescription>Spune-ne despre tine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nume Complet</Label>
            <Input
              id="fullName"
              placeholder="Ion Popescu"
              value={formData.fullName}
              maxLength={80}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">Universitate</Label>
            <Select
              value={formData.universityId}
              onValueChange={(value) => setFormData({ ...formData, universityId: value, faculty: "", subjects: [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alege universitatea" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px]">
                {universities.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.short_name} - {uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faculty">Facultate</Label>
              <Select
                value={formData.faculty}
                onValueChange={(value) => setFormData({ ...formData, faculty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alege facultatea" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[300px]">
                  {availableFaculties.map((faculty) => (
                    <SelectItem key={faculty} value={faculty}>
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Anul de Studiu</Label>
              <Select
                value={formData.yearOfStudy.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, yearOfStudy: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează anul" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="1">Anul 1</SelectItem>
                  <SelectItem value="2">Anul 2</SelectItem>
                  <SelectItem value="3">Anul 3</SelectItem>
                  <SelectItem value="4">Anul 4</SelectItem>
                  <SelectItem value="5">Master / Anul 5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Despre Tine</Label>
            <Textarea
              id="bio"
              placeholder="Spune-le celorlalți despre interesele, obiectivele și proiectele tale..."
              value={formData.bio}
              maxLength={500}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Looking For */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <GraduationCap className="w-5 h-5 text-secondary" />
            Ce cauți?
          </CardTitle>
          <CardDescription>Ajută-i pe ceilalți să înțeleagă cum pot colabora cu tine</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.lookingFor}
            onValueChange={(value) => setFormData({ ...formData, lookingFor: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectează ce cauți" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="teammates">Colegi de Proiect</SelectItem>
              <SelectItem value="study-group">Grup de Studiu</SelectItem>
              <SelectItem value="mentor">Un Mentor</SelectItem>
              <SelectItem value="mentee">Să fiu Mentor</SelectItem>
              <SelectItem value="tutoring">Ajutor la Meditații</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-accent" />
            Competențe
          </CardTitle>
          <CardDescription>
            Selectează competențele pe care le ai ({formData.skills.length} selectate)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant={formData.skills.includes(skill.name) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  formData.skills.includes(skill.name)
                    ? "gradient-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => toggleSkill(skill.name)}
              >
                {skill.name}
                {formData.skills.includes(skill.name) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <BookOpen className="w-5 h-5 text-primary" />
            Materii
          </CardTitle>
          <CardDescription>
            Selectează materiile pe care le studiezi ({formData.subjects.length} selectate)
            {formData.universityId && (
              <span className="block mt-1 text-xs">Afișăm materiile de la universitatea ta</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <Badge
                  key={subject.id}
                  variant={formData.subjects.includes(subject.name) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.subjects.includes(subject.name)
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleSubject(subject.name)}
                >
                  {subject.name}
                  {formData.subjects.includes(subject.name) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {formData.universityId
                  ? "Nu există materii disponibile pentru această universitate încă."
                  : "Selectează o universitate pentru a vedea materiile disponibile."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full gradient-primary text-primary-foreground h-12 font-semibold"
        disabled={isLoading || !formData.fullName || !formData.universityId}
      >
        <Save className="w-5 h-5 mr-2" />
        {isLoading ? "Se salvează..." : "Salvează Profilul"}
      </Button>
    </form>
  );
};
