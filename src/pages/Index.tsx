import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StudentCard } from "@/components/StudentCard";
import { FilterSection } from "@/components/FilterSection";
import { AIRecommendations } from "@/components/AIRecommendations";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profiles, skills, subjects, faculties, loading, fetchProfiles, currentUserProfile } = useProfiles();

  const handleGetStarted = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/auth?mode=signup");
    }
  };

  const handleBrowse = () => {
    const browseSection = document.getElementById("browse");
    browseSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
        onSignOut={signOut}
      />

      <HeroSection
        onGetStarted={handleGetStarted}
        onBrowse={handleBrowse}
        isAuthenticated={!!user}
      />

      {/* AI Recommendations Section */}
      <section className="py-12 bg-background">
        <div className="container">
          <AIRecommendations isAuthenticated={!!user && !!currentUserProfile} />
        </div>
      </section>

      {/* Browse Section */}
      <section id="browse" className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect{" "}
              <span className="gradient-text">Study Partner</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse through students from various faculties, filter by skills and subjects,
              and connect with those who match your goals.
            </p>
          </div>

          <FilterSection
            onFiltersChange={fetchProfiles}
            skills={skills}
            subjects={subjects}
            faculties={faculties}
          />

          {/* Results */}
          <div className="mt-10">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-pulse-soft text-muted-foreground">Loading...</div>
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile, index) => (
                  <div
                    key={profile.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <StudentCard
                      id={profile.id}
                      fullName={profile.full_name}
                      faculty={profile.faculty}
                      yearOfStudy={profile.year_of_study}
                      bio={profile.bio || undefined}
                      avatarUrl={profile.avatar_url || undefined}
                      lookingFor={profile.looking_for}
                      skills={profile.skills}
                      subjects={profile.subjects}
                      onConnect={(id) => console.log("Connect to:", id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">No students found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or be the first to create a profile!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
