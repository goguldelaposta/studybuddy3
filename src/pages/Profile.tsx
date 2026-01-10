import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProfileForm } from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { skills, subjects, universities, faculties, currentUserProfile, saveProfile, loading } = useProfiles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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

          <ProfileForm
            onSubmit={async (data) => {
              const success = await saveProfile(data);
              if (success) navigate("/");
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
