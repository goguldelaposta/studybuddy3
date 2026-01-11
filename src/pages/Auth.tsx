import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Mail, Lock, ArrowRight, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LegalModal } from "@/components/LegalModal";
import { z } from "zod";

const emailSchema = z.string().email("Te rugăm să introduci un email valid");

// Strong password validation for signup
const strongPasswordSchema = z
  .string()
  .min(8, "Parola trebuie să aibă minim 8 caractere")
  .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
  .regex(/[a-z]/, "Parola trebuie să conțină cel puțin o literă mică")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special");

// Simpler validation for login
const loginPasswordSchema = z.string().min(1, "Parola este obligatorie");

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "Minim 8 caractere", test: (p) => p.length >= 8 },
  { label: "O literă mare (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "O literă mică (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "O cifră (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "Un caracter special (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; gdpr?: string }>({});
  const [loading, setLoading] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy" | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { email?: string; password?: string; gdpr?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    // Use strong password validation for signup, simple for login
    const passwordResult = isSignUp 
      ? strongPasswordSchema.safeParse(password)
      : loginPasswordSchema.safeParse(password);
      
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    // GDPR consent required for signup
    if (isSignUp && !gdprConsent) {
      newErrors.gdpr = "Trebuie să accepți Politica de confidențialitate pentru a continua";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password, gdprConsent)
      : await signIn(email, password);
    setLoading(false);

    if (!error) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 shadow-elevated border-border/50 animate-scale-in">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">
            {isSignUp ? "Creează Cont" : "Bine ai revenit"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Alătură-te StudyBuddy și găsește parteneri de studiu"
              : "Conectează-te pentru a continua"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@universitate.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              
              {/* Password requirements checklist for signup */}
              {isSignUp && password.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Cerințe parolă:</p>
                  {passwordRequirements.map((req) => {
                    const passed = req.test(password);
                    return (
                      <div key={req.label} className="flex items-center gap-2 text-xs">
                        {passed ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className={passed ? "text-green-600" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* GDPR Consent for signup */}
            {isSignUp && (
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="gdpr"
                    checked={gdprConsent}
                    onCheckedChange={(checked) => setGdprConsent(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Am citit și sunt de acord cu{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModalType("privacy")}
                      className="text-primary hover:underline"
                    >
                      Politica de confidențialitate
                    </button>{" "}
                    și{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModalType("terms")}
                      className="text-primary hover:underline"
                    >
                      Termenii și condițiile
                    </button>
                    . Înțeleg că datele mele vor fi procesate conform GDPR.
                  </Label>
                </div>
                {errors.gdpr && <p className="text-xs text-destructive">{errors.gdpr}</p>}
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <Link to="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Ai uitat parola?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground h-11"
              disabled={loading}
            >
              {loading ? "Te rugăm așteaptă..." : isSignUp ? "Creează Cont" : "Conectare"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Ai deja cont?" : "Nu ai cont?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-primary hover:underline"
              >
                {isSignUp ? "Conectează-te" : "Înregistrează-te"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Modals */}
      <LegalModal
        open={legalModalType !== null}
        onOpenChange={(open) => !open && setLegalModalType(null)}
        type={legalModalType || "terms"}
      />
    </div>
  );
};

export default Auth;
