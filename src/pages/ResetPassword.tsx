import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lock, ArrowRight, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(8, "Parola trebuie să aibă minim 8 caractere")
  .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
  .regex(/[a-z]/, "Parola trebuie să conțină cel puțin o literă mică")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special");

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

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no session, redirect to auth page
    if (!session) {
      // Give it a moment to check for session from URL token
      const timer = setTimeout(() => {
        if (!session) {
          navigate("/auth");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    const passwordResult = strongPasswordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Parolele nu se potrivesc";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await updatePassword(password);
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
          <CardTitle className="font-display text-2xl">Resetează Parola</CardTitle>
          <CardDescription>
            Introdu noua ta parolă
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Parolă Nouă</Label>
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
              
              {password.length > 0 && (
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmă Parola</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground h-11"
              disabled={loading}
            >
              {loading ? "Te rugăm așteaptă..." : "Schimbă Parola"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
