import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";

interface FilterSectionProps {
  onFiltersChange: (filters: Filters) => void;
  skills: { id: string; name: string }[];
  subjects: { id: string; name: string; faculty: string }[];
  faculties: string[];
}

interface Filters {
  search: string;
  faculty: string;
  skills: string[];
  subjects: string[];
  lookingFor: string;
}

export const FilterSection = ({
  onFiltersChange,
  skills,
  subjects,
  faculties,
}: FilterSectionProps) => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    faculty: "",
    skills: [],
    subjects: [],
    lookingFor: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof Filters, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    updateFilter("skills", newSkills);
  };

  const toggleSubject = (subject: string) => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter((s) => s !== subject)
      : [...filters.subjects, subject];
    updateFilter("subjects", newSubjects);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = {
      search: "",
      faculty: "",
      skills: [],
      subjects: [],
      lookingFor: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.faculty ||
    filters.skills.length > 0 ||
    filters.subjects.length > 0 ||
    filters.lookingFor;

  return (
    <div className="glass rounded-xl p-6 space-y-4 animate-fade-up">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, skills, or subjects..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-12 h-12 text-base bg-background/50 border-border focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.faculty}
          onValueChange={(value) => updateFilter("faculty", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px] bg-background/50">
            <SelectValue placeholder="All Faculties" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Faculties</SelectItem>
            {faculties.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.lookingFor}
          onValueChange={(value) => updateFilter("lookingFor", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px] bg-background/50">
            <SelectValue placeholder="Looking for..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Any type</SelectItem>
            <SelectItem value="teammates">Project Teammates</SelectItem>
            <SelectItem value="study-group">Study Group</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="tutoring">Tutoring</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? "Hide" : "More"} Filters
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
            <X className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-border/50 animate-fade-in">
          {/* Skills */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 12).map((skill) => (
                <Badge
                  key={skill.id}
                  variant={filters.skills.includes(skill.name) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    filters.skills.includes(skill.name)
                      ? "gradient-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleSkill(skill.name)}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.slice(0, 8).map((subject) => (
                <Badge
                  key={subject.id}
                  variant={filters.subjects.includes(subject.name) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    filters.subjects.includes(subject.name)
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleSubject(subject.name)}
                >
                  {subject.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-muted-foreground">Active:</span>
          {filters.faculty && (
            <Badge variant="secondary" className="text-xs">
              {filters.faculty}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter("faculty", "")}
              />
            </Badge>
          )}
          {filters.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => toggleSkill(skill)}
              />
            </Badge>
          ))}
          {filters.subjects.map((subject) => (
            <Badge key={subject} variant="secondary" className="text-xs">
              {subject}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => toggleSubject(subject)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
