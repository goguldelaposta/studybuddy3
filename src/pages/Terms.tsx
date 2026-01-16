import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/auth?mode=signup">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi
          </Button>
        </Link>

        <Card className="shadow-elevated border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-2xl md:text-3xl">
              Termeni și Condiții
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ultima actualizare: Ianuarie 2026
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Despre Platformă</h2>
              <p className="text-muted-foreground">
                StudyBuddy este o platformă gratuită dedicată studenților, care facilitează 
                colaborarea academică și comunicarea între utilizatori.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Responsabilitatea Utilizatorilor</h2>
              <p className="text-muted-foreground">
                Utilizatorii sunt pe deplin responsabili pentru conținutul pe care îl încarcă 
                sau îl distribuie prin intermediul platformei.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. Conținut Interzis</h2>
              <p className="text-muted-foreground">
                Este strict interzis conținutul ilegal, ofensator, discriminatoriu sau 
                protejat de drepturi de autor fără acordul titularului.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Suspendarea Conturilor</h2>
              <p className="text-muted-foreground">
                Ne rezervăm dreptul de a suspenda sau șterge conturile utilizatorilor care 
                încalcă acești termeni sau regulile comunității.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Limitarea Răspunderii</h2>
              <p className="text-muted-foreground">
                Platforma este oferită „as is" (așa cum este), fără garanții explicite sau 
                implicite privind funcționalitatea sau disponibilitatea serviciului.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
              <p className="text-muted-foreground">
                Pentru întrebări sau nelămuriri, ne puteți contacta la:{" "}
                <a href="mailto:contact@studybuddy.co.uk" className="text-primary hover:underline">
                  contact@studybuddy.co.uk
                </a>
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                © 2026 StudyBuddy. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
