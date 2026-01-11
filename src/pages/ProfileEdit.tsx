import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProfileForm } from "@/components/ProfileForm";
import { PrivacySettings, PrivacySettingsData, getDefaultPrivacySettings } from "@/components/PrivacySettings";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Camera, Trash2, Loader2 } from "lucide-react";

const ProfileEdit = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { skills, subjects, universities, faculties, currentUserProfile, saveProfile, savePrivacySettings, saveAvatarUrl, loading } = useProfiles();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsData>(getDefaultPrivacySettings());
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ȘTERGE CONTUL") {
      toast({
        title: "Text incorect",
        description: "Scrie 'ȘTERGE CONTUL' pentru a confirma ștergerea.",
        variant: "destructive",
      });
      return;
    }

    setDeletingAccount(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      
      if (error) {
        throw error;
      }

      toast({
        title: "Cont șters",
        description: "Contul tău a fost șters cu succes.",
      });

      // Clear local state and redirect
      setShowDeleteDialog(false);
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut șterge contul. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
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

              {/* Delete Account Section */}
              <Card className="border-destructive/50 mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Șterge Contul
                  </CardTitle>
                  <CardDescription>
                    Această acțiune este permanentă și nu poate fi anulată. Toate datele tale vor fi șterse.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Șterge Contul Meu
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            Această acțiune va șterge permanent contul tău și toate datele asociate:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Profilul și toate informațiile personale</li>
                            <li>Toate mesajele și conversațiile</li>
                            <li>Prieteniile și cererile de prietenie</li>
                            <li>Grupurile create și membriile</li>
                            <li>Anunțurile publicate</li>
                            <li>Badge-urile câștigate</li>
                          </ul>
                          <p className="font-semibold mt-4">
                            Scrie <span className="text-destructive">ȘTERGE CONTUL</span> pentru a confirma:
                          </p>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="ȘTERGE CONTUL"
                            className="mt-2"
                          />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                          Anulează
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deletingAccount || deleteConfirmText !== "ȘTERGE CONTUL"}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletingAccount ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Se șterge...
                            </>
                          ) : (
                            "Șterge Definitiv"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
