import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Mail, GraduationCap, Calendar, FileText, Sparkles, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PrivacySettingsData {
  show_email: boolean;
  show_faculty: boolean;
  show_year: boolean;
  show_bio: boolean;
  show_skills: boolean;
  show_subjects: boolean;
  profile_visibility: 'public' | 'authenticated' | 'connections_only';
}

interface PrivacySettingsProps {
  settings: PrivacySettingsData;
  onChange: (settings: PrivacySettingsData) => void;
}

const defaultSettings: PrivacySettingsData = {
  show_email: false,
  show_faculty: true,
  show_year: true,
  show_bio: true,
  show_skills: true,
  show_subjects: true,
  profile_visibility: 'authenticated',
};

export const getDefaultPrivacySettings = (): PrivacySettingsData => defaultSettings;

export const PrivacySettings = ({ settings, onChange }: PrivacySettingsProps) => {
  const handleToggle = (key: keyof PrivacySettingsData) => {
    if (key === 'profile_visibility') return;
    onChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleVisibilityChange = (value: string) => {
    onChange({
      ...settings,
      profile_visibility: value as 'public' | 'authenticated' | 'connections_only',
    });
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Shield className="w-5 h-5 text-primary" />
          Setări de Confidențialitate
        </CardTitle>
        <CardDescription>
          Controlează ce informații pot vedea alți utilizatori despre tine
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-2">
          <Label htmlFor="visibility" className="text-sm font-medium">
            Vizibilitatea profilului
          </Label>
          <Select
            value={settings.profile_visibility}
            onValueChange={handleVisibilityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selectează vizibilitatea" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="authenticated">
                Doar utilizatori autentificați
              </SelectItem>
              <SelectItem value="connections_only">
                Doar conexiunile mele (grupuri/conversații)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {settings.profile_visibility === 'authenticated' 
              ? 'Toți utilizatorii autentificați pot vedea profilul tău'
              : 'Doar persoanele cu care ai conversații sau sunteți în același grup pot vedea profilul tău'}
          </p>
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            Arată următoarele informații:
          </p>

          {/* Email Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="show_email" className="text-sm font-medium cursor-pointer">
                  Adresa de email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Permite altor utilizatori să îți vadă email-ul
                </p>
              </div>
            </div>
            <Switch
              id="show_email"
              checked={settings.show_email}
              onCheckedChange={() => handleToggle('show_email')}
            />
          </div>

          {/* Faculty Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="show_faculty" className="text-sm font-medium cursor-pointer">
                  Facultatea
                </Label>
                <p className="text-xs text-muted-foreground">
                  Afișează facultatea ta în profil
                </p>
              </div>
            </div>
            <Switch
              id="show_faculty"
              checked={settings.show_faculty}
              onCheckedChange={() => handleToggle('show_faculty')}
            />
          </div>

          {/* Year Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="show_year" className="text-sm font-medium cursor-pointer">
                  Anul de studiu
                </Label>
                <p className="text-xs text-muted-foreground">
                  Afișează anul de studiu în profil
                </p>
              </div>
            </div>
            <Switch
              id="show_year"
              checked={settings.show_year}
              onCheckedChange={() => handleToggle('show_year')}
            />
          </div>

          {/* Bio Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="show_bio" className="text-sm font-medium cursor-pointer">
                  Biografia
                </Label>
                <p className="text-xs text-muted-foreground">
                  Afișează descrierea ta în profil
                </p>
              </div>
            </div>
            <Switch
              id="show_bio"
              checked={settings.show_bio}
              onCheckedChange={() => handleToggle('show_bio')}
            />
          </div>

          {/* Skills Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="show_skills" className="text-sm font-medium cursor-pointer">
                  Competențele
                </Label>
                <p className="text-xs text-muted-foreground">
                  Afișează competențele tale în profil
                </p>
              </div>
            </div>
            <Switch
              id="show_skills"
              checked={settings.show_skills}
              onCheckedChange={() => handleToggle('show_skills')}
            />
          </div>

          {/* Subjects Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="show_subjects" className="text-sm font-medium cursor-pointer">
                  Materiile
                </Label>
                <p className="text-xs text-muted-foreground">
                  Afișează materiile tale în profil
                </p>
              </div>
            </div>
            <Switch
              id="show_subjects"
              checked={settings.show_subjects}
              onCheckedChange={() => handleToggle('show_subjects')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
