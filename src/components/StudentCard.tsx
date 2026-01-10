import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, BookOpen, MessageCircle, UserPlus, Building } from "lucide-react";

interface StudentCardProps {
  id: string;
  fullName: string;
  faculty: string;
  yearOfStudy: number;
  bio?: string;
  avatarUrl?: string;
  lookingFor: string;
  skills: string[];
  subjects: string[];
  universityShortName?: string;
  userId?: string;
  onConnect?: (id: string) => void;
}

const getUniversityColor = (shortName?: string) => {
  const colors: Record<string, string> = {
    "UPB": "bg-blue-100 text-blue-700 border-blue-200",
    "ASE": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "UB": "bg-purple-100 text-purple-700 border-purple-200",
    "UMFCD": "bg-red-100 text-red-700 border-red-200",
    "SNSPA": "bg-amber-100 text-amber-700 border-amber-200",
    "UAUIM": "bg-pink-100 text-pink-700 border-pink-200",
    "UTCB": "bg-orange-100 text-orange-700 border-orange-200",
    "USAMV": "bg-green-100 text-green-700 border-green-200",
  };
  return colors[shortName || ""] || "bg-muted text-muted-foreground border-border";
};

const getLookingForLabel = (value: string) => {
  const labels: Record<string, string> = {
    "teammates": "Colegi de proiect",
    "study-group": "Grup de studiu",
    "mentor": "Mentor",
    "mentee": "Să fiu mentor",
    "tutoring": "Meditații",
  };
  return labels[value] || value;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const StudentCard = ({
  id,
  fullName,
  faculty,
  yearOfStudy,
  bio,
  avatarUrl,
  lookingFor,
  skills,
  subjects,
  universityShortName,
  userId,
  onConnect,
}: StudentCardProps) => {
  const navigate = useNavigate();

  const handleMessage = () => {
    if (userId) {
      navigate(`/messages?with=${userId}`);
    }
  };

  return (
    <Card className="group hover-lift bg-card shadow-card border-border/50 overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/10 ring-offset-2">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="gradient-primary text-primary-foreground font-display font-semibold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-foreground truncate">
              {fullName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {universityShortName && (
                <Badge variant="outline" className={`${getUniversityColor(universityShortName)} text-xs font-medium`}>
                  <Building className="w-3 h-3 mr-1" />
                  {universityShortName}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">Anul {yearOfStudy}</span>
            </div>
          </div>
        </div>

        {/* Faculty */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground truncate">{faculty}</span>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {bio}
          </p>
        )}

        {/* Looking for */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <BookOpen className="w-4 h-4 text-secondary" />
          <span className="text-muted-foreground">Caută:</span>
          <span className="font-medium text-foreground">{getLookingForLabel(lookingFor)}</span>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Competențe</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-medium">
                  {skill}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Materii</p>
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 3).map((subject) => (
                <Badge key={subject} variant="outline" className="text-xs bg-muted/50">
                  {subject}
                </Badge>
              ))}
              {subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{subjects.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gradient-primary text-primary-foreground"
            onClick={() => onConnect?.(id)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Conectează-te
          </Button>
          <Button variant="outline" size="sm" className="px-3" onClick={handleMessage}>
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
