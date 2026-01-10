import { Button } from "@/components/ui/button";
import { Users, Sparkles, ArrowRight, BookOpen, Code, Lightbulb, MapPin } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onBrowse: () => void;
  isAuthenticated: boolean;
}

export const HeroSection = ({ onGetStarted, onBrowse, isAuthenticated }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-up">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">
              București • 15+ Universități
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Găsește-ți{" "}
            <span className="gradient-text">
              Colegii
            </span>{" "}
            de Studiu Potriviți
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Conectează-te cu studenți din universitățile din București pentru proiecte, 
            grupuri de studiu și colaborări academice. Platformă dedicată comunității studențești din România.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground h-14 px-8 text-lg font-semibold shadow-elevated hover:opacity-90 transition-opacity"
              onClick={onGetStarted}
            >
              <Users className="w-5 h-5 mr-2" />
              {isAuthenticated ? "Creează Profil" : "Începe Gratuit"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg font-semibold"
              onClick={onBrowse}
            >
              Explorează Studenți
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Grupuri de Studiu</h3>
              <p className="text-sm text-muted-foreground">
                Găsește colegi care studiază aceleași materii la facultatea ta
              </p>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 mx-auto">
                <Code className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Echipe de Proiect</h3>
              <p className="text-sm text-muted-foreground">
                Formează echipe cu competențe complementare pentru proiecte
              </p>
            </div>
            <div className="glass rounded-xl p-6 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Mentorat</h3>
              <p className="text-sm text-muted-foreground">
                Conectează-te cu studenți din anii mai mari pentru îndrumare
              </p>
            </div>
          </div>

          {/* Universities showcase */}
          <div className="mt-16 animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <p className="text-sm text-muted-foreground mb-4">Universități partenere din București</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
              {["UPB", "ASE", "UB", "UMFCD", "SNSPA", "UAUIM", "UTCB", "USAMV"].map((uni) => (
                <span key={uni} className="px-3 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors">
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
