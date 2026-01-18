import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ExamsFiltersProps {
  faculties: string[];
  subjects: string[];
  selectedFaculty: string;
  selectedSubject: string;
  onFacultyChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ExamsFilters({
  faculties,
  subjects,
  selectedFaculty,
  selectedSubject,
  onFacultyChange,
  onSubjectChange,
  onClearFilters,
}: ExamsFiltersProps) {
  const hasFilters = selectedFaculty || selectedSubject;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={selectedFaculty} onValueChange={onFacultyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Toate facultățile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toate facultățile</SelectItem>
          {faculties.map((faculty) => (
            <SelectItem key={faculty} value={faculty}>
              {faculty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Toate materiile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toate materiile</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
          <X className="w-4 h-4" />
          Șterge filtre
        </Button>
      )}
    </div>
  );
}
