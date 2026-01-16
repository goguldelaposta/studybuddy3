import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
              Politica de Confidențialitate
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ultima actualizare: Ianuarie 2026
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground">1. Date Colectate</h2>
              <p className="text-muted-foreground">
                Colectăm următoarele date personale:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Adresă de email</li>
                <li>Nume și prenume</li>
                <li>Date de autentificare</li>
                <li>Adresă IP</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">2. Scopul Colectării</h2>
              <p className="text-muted-foreground">
                Datele sunt colectate pentru:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Crearea și gestionarea contului de utilizator</li>
                <li>Comunicare cu utilizatorii</li>
                <li>Asigurarea securității platformei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">3. Protecția Datelor</h2>
              <p className="text-muted-foreground">
                Datele dumneavoastră personale nu sunt vândute sau distribuite către terți 
                în scopuri comerciale. Implementăm măsuri tehnice și organizatorice pentru 
                protejarea datelor.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">4. Drepturile Utilizatorilor (GDPR)</h2>
              <p className="text-muted-foreground">
                Conform Regulamentului General privind Protecția Datelor (GDPR), aveți dreptul:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Să accesați datele personale pe care le deținem despre dumneavoastră</li>
                <li>Să solicitați rectificarea datelor incorecte</li>
                <li>Să solicitați ștergerea contului și a datelor asociate</li>
                <li>Să vă retrageți consimțământul în orice moment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">5. Cookie-uri</h2>
              <p className="text-muted-foreground">
                Folosim cookie-uri esențiale pentru autentificare și funcționarea platformei. 
                Nu folosim cookie-uri de tracking fără consimțământul dumneavoastră explicit. 
                Puteți accepta sau refuza cookie-urile opționale din setările browserului.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
              <p className="text-muted-foreground">
                Pentru exercitarea drepturilor GDPR sau pentru orice întrebări privind 
                datele personale, ne puteți contacta la:{" "}
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

export default PrivacyPolicy;
