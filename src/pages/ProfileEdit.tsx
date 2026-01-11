import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProfileForm } from "@/components/ProfileForm";
import { PrivacySettings, PrivacySettingsData, getDefaultPrivacySettings } from "@/components/PrivacySettings";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Shield, Camera } from "lucide-react";

const ProfileEdit = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { skills, subjects, universities, faculties, currentUserProfile, saveProfile, savePrivacySettings, saveAvatarUrl, loading } = useProfiles();
  const navigate = useNavigate();
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsData>(getDefaultPrivacySettings());
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (currentUserProfile?.privacy_settings) {
      setPrivacySettings(currentUserProfile.privacy_settings);
    }
    if (currentUserProfile?.avatar_url) {
      setAvatarUrl(currentUserProfile.avatar_url);
    }
  }, [currentUserProfile]);

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url || null);
    await saveAvatarUrl(url || null);
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    await savePrivacySettings(privacySettings);
    setSavingPrivacy(false);
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={true}
        user={{ email: user.email || "", fullName: currentUserProfile?.full_name }}
        onSignOut={signOut}
      />

      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">
            {currentUserProfile ? "Editează Profilul" : "Creează Profilul"}
          </h1>
          <p className="text-muted-foreground mb-8">
            Completează profilul pentru a ajuta colegii să te găsească.
          </p>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Poză
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Confidențialitate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileForm
                onSubmit={async (data) => {
                  const success = await saveProfile(data);
                  if (success) navigate("/profile");
                }}
                initialData={
                  currentUserProfile
                    ? {
                        fullName: currentUserProfile.full_name,
                        faculty: currentUserProfile.faculty,
                        yearOfStudy: currentUserProfile.year_of_study,
                        bio: currentUserProfile.bio || "",
                        lookingFor: currentUserProfile.looking_for,
                        skills: currentUserProfile.skills,
                        subjects: currentUserProfile.subjects,
                        universityId: currentUserProfile.university_id || undefined,
                      }
                    : undefined
                }
                availableSkills={skills}
                availableSubjects={subjects}
                universities={universities}
                faculties={faculties}
                isLoading={loading}
              />
            </TabsContent>

            <TabsContent value="avatar">
              <Card className="shadow-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Camera className="w-5 h-5 text-primary" />
                    Poză de Profil
                  </CardTitle>
                  <CardDescription>
                    Adaugă o poză pentru a te face mai ușor de recunoscut
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl}
                    userId={user.id}
                    fullName={currentUserProfile?.full_name}
                    onUploadComplete={handleAvatarUpload}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <PrivacySettings 
                settings={privacySettings} 
                onChange={setPrivacySettings} 
              />
              
              <Button
                onClick={handleSavePrivacy}
                disabled={savingPrivacy}
                className="w-full gradient-primary text-primary-foreground h-12 font-semibold"
              >
                <Shield className="w-5 h-5 mr-2" />
                {savingPrivacy ? "Se salvează..." : "Salvează Setările de Confidențialitate"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
