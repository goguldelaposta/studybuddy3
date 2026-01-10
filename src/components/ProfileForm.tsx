import { useState } from "react";
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
import { User, GraduationCap, Sparkles, BookOpen, Save, X } from "lucide-react";

interface ProfileFormProps {
  onSubmit: (data: ProfileData) => void;
  initialData?: Partial<ProfileData>;
  availableSkills: { id: string; name: string }[];
  availableSubjects: { id: string; name: string; faculty: string }[];
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
}

export const ProfileForm = ({
  onSubmit,
  initialData,
  availableSkills,
  availableSubjects,
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
  });

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

  const filteredSubjects = formData.faculty
    ? availableSubjects.filter((s) => s.faculty === formData.faculty)
    : availableSubjects;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <User className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>Tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select
                value={formData.faculty}
                onValueChange={(value) => setFormData({ ...formData, faculty: value, subjects: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your faculty" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty} value={faculty}>
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              <Select
                value={formData.yearOfStudy.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, yearOfStudy: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                  <SelectItem value="5">Year 5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about your interests, goals, and what you're working on..."
              value={formData.bio}
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
            What are you looking for?
          </CardTitle>
          <CardDescription>Help others understand how they can collaborate with you</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.lookingFor}
            onValueChange={(value) => setFormData({ ...formData, lookingFor: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select what you're looking for" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="teammates">Project Teammates</SelectItem>
              <SelectItem value="study-group">Study Group Members</SelectItem>
              <SelectItem value="mentor">A Mentor</SelectItem>
              <SelectItem value="mentee">Mentees to Guide</SelectItem>
              <SelectItem value="tutoring">Tutoring Help</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-accent" />
            Skills
          </CardTitle>
          <CardDescription>
            Select skills you have ({formData.skills.length} selected)
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
            Subjects
          </CardTitle>
          <CardDescription>
            Select subjects you're taking or interested in ({formData.subjects.length} selected)
            {formData.faculty && (
              <span className="block mt-1 text-xs">Showing subjects for {formData.faculty}</span>
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
                {formData.faculty
                  ? "No subjects available for this faculty yet."
                  : "Select a faculty to see available subjects."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full gradient-primary text-primary-foreground h-12 font-semibold"
        disabled={isLoading || !formData.fullName || !formData.faculty}
      >
        <Save className="w-5 h-5 mr-2" />
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};
