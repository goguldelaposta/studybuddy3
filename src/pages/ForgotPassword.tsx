import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const emailSchema = z.string().email("Te rugăm să introduci un email valid");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const validate = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (!error) {
      setEmailSent(true);
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
            {emailSent ? "Verifică Email-ul" : "Ai Uitat Parola?"}
          </CardTitle>
          <CardDescription>
            {emailSent
              ? "Am trimis un link de resetare a parolei la adresa ta de email."
              : "Introdu adresa de email și îți vom trimite un link pentru a reseta parola."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Dacă există un cont asociat cu <strong>{email}</strong>, vei primi un email cu instrucțiuni pentru resetarea parolei.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Trimite din nou
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  Înapoi la autentificare
                </Link>
              </div>
            </div>
          ) : (
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
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground h-11"
                disabled={loading}
              >
                {loading ? "Se trimite..." : "Trimite Link de Resetare"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center">
                <Link to="/auth" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  Înapoi la autentificare
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
