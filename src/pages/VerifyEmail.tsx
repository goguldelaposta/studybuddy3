import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if email is already confirmed
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate("/");
    }
  }, [user, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!session && !user) {
      navigate("/auth");
    }
  }, [session, user, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Eroare",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email retrimis!",
          description: "Verifică-ți inbox-ul pentru email-ul de confirmare.",
        });
      }
    } catch (err) {
      toast({
        title: "Eroare",
        description: "Nu am putut retrimite email-ul. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      // Refresh the session to get updated user data
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        toast({
          title: "Eroare",
          description: "Nu am putut verifica starea. Încearcă din nou.",
          variant: "destructive",
        });
      } else if (data.user?.email_confirmed_at) {
        toast({
          title: "Email verificat!",
          description: "Contul tău este acum activ.",
        });
        navigate("/");
      } else {
        toast({
          title: "Email neverificat",
          description: "Email-ul tău nu a fost încă verificat. Verifică inbox-ul.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Eroare",
        description: "Nu am putut verifica starea. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifică-ți email-ul</CardTitle>
          <CardDescription>
            Ți-am trimis un email de confirmare la{" "}
            <span className="font-semibold text-foreground">{user?.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="mb-2">Pentru a folosi toate funcțiile site-ului, trebuie să îți confirmi adresa de email.</p>
            <p>Dă click pe link-ul din email pentru a-ți activa contul.</p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleCheckVerification} 
              className="w-full"
              disabled={checking}
            >
              {checking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Se verifică...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Am confirmat email-ul
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleResendEmail} 
              className="w-full"
              disabled={resending}
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Se retrimite...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Retrimite email-ul
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Nu găsești email-ul? Verifică și folderul de spam.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
