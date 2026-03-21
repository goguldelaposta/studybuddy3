import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from '@capacitor/core';

// Pe mobile nativ folosim deep link scheme în loc de http
function getRedirectUrl(path: string): string {
  if (Capacitor.isNativePlatform()) {
    return `studybuddy:/${path}`;
  }
  return `${window.location.origin}${path}`;
}

interface SignUpProfileData {
  fullName: string;
  universityId: string;
  faculty: string;
  yearOfStudy: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, gdprConsent?: boolean, profileData?: SignUpProfileData) => Promise<{ error: Error | null }>;
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

  const getAuthErrorMessage = (errorMessage: string): string => {
    const errorMap: Record<string, string> = {
      "User already registered": "Un cont cu acest email există deja. Te rugăm să te autentifici.",
      "Email already registered": "Acest email este deja înregistrat. Te rugăm să te autentifici.",
      "Email address already exists": "Acest email este deja folosit. Te rugăm să folosești alt email sau să te autentifici.",
      "A user with this email address has already been registered": "Un utilizator cu acest email există deja.",
      "Invalid login credentials": "Email sau parolă incorectă.",
      "Email not confirmed": "Email-ul nu a fost confirmat. Verifică-ți inbox-ul.",
      "Invalid email or password": "Email sau parolă incorectă.",
      "Password should be at least 6 characters": "Parola trebuie să aibă minim 6 caractere.",
      "Signup requires a valid password": "Te rugăm să introduci o parolă validă.",
      "Unable to validate email address: invalid format": "Format de email invalid.",
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return errorMessage;
  };

  const signUp = async (email: string, password: string, gdprConsent: boolean = false, profileData?: SignUpProfileData) => {
    try {
      const redirectUrl = getRedirectUrl('/');
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
          description: getAuthErrorMessage(error.message),
          variant: "destructive",
        });
        return { error };
      }

      // Check if user already exists (Supabase returns user with identities = [] for existing email)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Înregistrare eșuată",
          description: "Un cont cu acest email există deja. Te rugăm să te autentifici.",
          variant: "destructive",
        });
        return { error: new Error("Email already registered") };
      }

      // Update profile with GDPR consent and profile data if user was created
      if (data.user) {
        const updateData: Record<string, unknown> = {};
        
        if (gdprConsent) {
          updateData.gdpr_consent = true;
          updateData.gdpr_consent_at = new Date().toISOString();
        }
        
        if (profileData) {
          updateData.full_name = profileData.fullName;
          updateData.university_id = profileData.universityId;
          updateData.faculty = profileData.faculty;
          updateData.year_of_study = profileData.yearOfStudy;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', data.user.id);

          if (profileError) {
            console.error('Failed to save profile data:', profileError);
          }
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
        description: getAuthErrorMessage(error.message),
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
          description: getAuthErrorMessage(error.message),
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
        description: getAuthErrorMessage(error.message),
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Always call signOut with local scope to clear tokens
      await supabase.auth.signOut({ scope: 'local' });
      
      // Manually clear any remaining Supabase auth tokens from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      toast({
        title: "Deconectat",
        description: "Te-ai deconectat cu succes.",
      });
      
      // Force page reload to auth
      window.location.href = '/auth';
    } catch (err) {
      console.error('Sign out error:', err);
      // Clear tokens and state even on error
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = getRedirectUrl('/auth/reset-password');
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
