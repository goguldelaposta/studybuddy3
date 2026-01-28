import { Button } from "@/components/ui/button";
import { Users, ArrowRight, BookOpen, Code, Lightbulb, MapPin } from "lucide-react";
import { triggerHaptic } from "@/hooks/useHapticFeedback";

interface HeroSectionProps {
  onGetStarted: () => void;
  onBrowse: () => void;
  isAuthenticated: boolean;
}

export const HeroSection = ({
  onGetStarted,
  onBrowse,
  isAuthenticated
}: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Video Background with overlay */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover">
          <source src="https://kxlglvjazzuarhofophh.supabase.co/storage/v1/object/public/viedeos//vecteezy_online-education-2d-animation_35447858.mov" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>

      <div className="container relative z-10 py-12 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6 animate-fade-up">
            <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">
              București • 15+ Universități
            </span>
          </div>

          {/* Main heading */}
          <h1 
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 animate-fade-up leading-tight" 
            style={{ animationDelay: "0.1s", lineHeight: "1.15" }}
          >
            Găsește-ți{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Colegii
            </span>{" "}
            de Studiu{" "}
            <span className="bg-gradient-to-r from-purple-500 to-secondary bg-clip-text text-transparent">
              Potriviți
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up px-2" 
            style={{ animationDelay: "0.2s" }}
          >
            Conectează-te cu studenți din universitățile din București pentru proiecte, grupuri de studiu și colaborări academice.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 animate-fade-up px-4" 
            style={{ animationDelay: "0.3s" }}
          >
            <Button 
              size="lg" 
              className="gradient-primary text-primary-foreground h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:opacity-90 transition-all duration-300 w-full sm:w-auto" 
              onClick={() => {
                triggerHaptic('medium');
                onGetStarted();
              }}
            >
              <Users className="w-5 h-5 mr-2 flex-shrink-0" />
              {isAuthenticated ? "Creează Profil" : "Începe Gratuit"}
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold w-full sm:w-auto" 
              onClick={() => {
                triggerHaptic('light');
                onBrowse();
              }}
            >
              Explorează Studenți
            </Button>
          </div>

          {/* Feature highlights */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up" 
            style={{ animationDelay: "0.4s" }}
          >
            <div className="glass rounded-xl p-5 hover-lift">
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-3 mx-auto">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-base mb-1.5">Grupuri de Studiu</h3>
              <p className="text-sm text-muted-foreground">
                Găsește colegi care studiază aceleași materii
              </p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift">
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-3 mx-auto">
                <Code className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-bold text-base mb-1.5">Echipe de Proiect</h3>
              <p className="text-sm text-muted-foreground">
                Formează echipe cu competențe complementare
              </p>
            </div>
            <div className="glass rounded-xl p-5 hover-lift">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-3 mx-auto">
                <Lightbulb className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-display font-bold text-base mb-1.5">Mentorat</h3>
              <p className="text-sm text-muted-foreground">
                Conectează-te cu studenți din anii mai mari
              </p>
            </div>
          </div>

          {/* Universities showcase */}
          <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <p className="text-sm text-muted-foreground mb-3">Universități partenere</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm font-medium text-muted-foreground">
              {["UPB", "ASE", "UB", "UMFCD", "SNSPA", "UAUIM", "UTCB", "USAMV"].map(uni => (
                <span 
                  key={uni} 
                  className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                >
                  {uni}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};