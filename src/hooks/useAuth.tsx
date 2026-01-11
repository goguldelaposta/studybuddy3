import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, gdprConsent?: boolean) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, gdprConsent: boolean = false) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) {
        toast({
          title: "Înregistrare eșuată",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Update profile with GDPR consent if user was created
      if (data.user && gdprConsent) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            gdpr_consent: true,
            gdpr_consent_at: new Date().toISOString(),
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Failed to save GDPR consent:', profileError);
        }
      }
      
      toast({
        title: "Verifică-ți email-ul!",
        description: "Ți-am trimis un email de confirmare. Verifică inbox-ul pentru a-ți activa contul.",
      });
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Înregistrare eșuată",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Autentificare eșuată",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Bine ai revenit!",
        description: "Te-ai conectat cu succes.",
      });
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Autentificare eșuată",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Check if there's an active session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Sign out error:', error);
        }
      }
      
      // Clear local state regardless
      setUser(null);
      setSession(null);
      
      toast({
        title: "Deconectat",
        description: "Te-ai deconectat cu succes.",
      });
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (err) {
      console.error('Sign out error:', err);
      // Clear state and redirect anyway
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        toast({
          title: "Eroare",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Email trimis!",
        description: "Verifică-ți emailul pentru linkul de resetare a parolei.",
      });
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        toast({
          title: "Eroare",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Parolă actualizată!",
        description: "Parola ta a fost schimbată cu succes.",
      });
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
