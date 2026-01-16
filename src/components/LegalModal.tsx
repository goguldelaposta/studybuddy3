import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "terms" | "privacy";
}

export const LegalModal = ({ open, onOpenChange, type }: LegalModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl">
            {type === "terms" ? "Termeni și Condiții" : "Politica de Confidențialitate"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ultima actualizare: Ianuarie 2026
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-6 pb-6">
          {type === "terms" ? <TermsContent /> : <PrivacyContent />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const TermsContent = () => (
  <div className="space-y-6 pt-4">
    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">1. Despre Platformă</h2>
      <p className="text-sm text-muted-foreground">
        StudyBuddy este o platformă gratuită dedicată studenților, care facilitează 
        colaborarea academică și comunicarea între utilizatori.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">2. Responsabilitatea Utilizatorilor</h2>
      <p className="text-sm text-muted-foreground">
        Utilizatorii sunt pe deplin responsabili pentru conținutul pe care îl încarcă 
        sau îl distribuie prin intermediul platformei.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">3. Conținut Interzis</h2>
      <p className="text-sm text-muted-foreground">
        Este strict interzis conținutul ilegal, ofensator, discriminatoriu sau 
        protejat de drepturi de autor fără acordul titularului.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">4. Suspendarea Conturilor</h2>
      <p className="text-sm text-muted-foreground">
        Ne rezervăm dreptul de a suspenda sau șterge conturile utilizatorilor care 
        încalcă acești termeni sau regulile comunității.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">5. Limitarea Răspunderii</h2>
      <p className="text-sm text-muted-foreground">
        Platforma este oferită „as is" (așa cum este), fără garanții explicite sau 
        implicite privind funcționalitatea sau disponibilitatea serviciului.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">6. Contact</h2>
      <p className="text-sm text-muted-foreground">
        Pentru întrebări sau nelămuriri, ne puteți contacta la:{" "}
        <a href="mailto:contact@studybuddy.ro" className="text-primary hover:underline">
          contact@studybuddy.ro
        </a>
      </p>
    </section>

    <div className="pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground text-center">
        © 2026 StudyBuddy. All rights reserved.
      </p>
    </div>
  </div>
);

const PrivacyContent = () => (
  <div className="space-y-6 pt-4">
    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">1. Date Colectate</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Colectăm următoarele date personale:
      </p>
      <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
        <li>Adresă de email</li>
        <li>Nume și prenume</li>
        <li>Date de autentificare</li>
        <li>Adresă IP</li>
      </ul>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">2. Scopul Colectării</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Datele sunt colectate pentru:
      </p>
      <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
        <li>Crearea și gestionarea contului de utilizator</li>
        <li>Comunicare cu utilizatorii</li>
        <li>Asigurarea securității platformei</li>
      </ul>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">3. Protecția Datelor</h2>
      <p className="text-sm text-muted-foreground">
        Datele dumneavoastră personale nu sunt vândute sau distribuite către terți 
        în scopuri comerciale. Implementăm măsuri tehnice și organizatorice pentru 
        protejarea datelor.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">4. Drepturile Utilizatorilor (GDPR)</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Conform Regulamentului General privind Protecția Datelor (GDPR), aveți dreptul:
      </p>
      <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
        <li>Să accesați datele personale pe care le deținem despre dumneavoastră</li>
        <li>Să solicitați rectificarea datelor incorecte</li>
        <li>Să solicitați ștergerea contului și a datelor asociate</li>
        <li>Să vă retrageți consimțământul în orice moment</li>
      </ul>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">5. Cookie-uri</h2>
      <p className="text-sm text-muted-foreground">
        Folosim cookie-uri esențiale pentru autentificare și funcționarea platformei. 
        Nu folosim cookie-uri de tracking fără consimțământul dumneavoastră explicit. 
        Puteți accepta sau refuza cookie-urile opționale din setările browserului.
      </p>
    </section>

    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">6. Contact</h2>
      <p className="text-sm text-muted-foreground">
        Pentru exercitarea drepturilor GDPR sau pentru orice întrebări privind 
        datele personale, ne puteți contacta la:{" "}
        <a href="mailto:contact@studybuddy.ro" className="text-primary hover:underline">
          contact@studybuddy.ro
        </a>
      </p>
    </section>

    <div className="pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground text-center">
        © 2026 StudyBuddy. All rights reserved.
      </p>
    </div>
  </div>
);
