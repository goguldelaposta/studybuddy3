import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Eye, EyeOff, Check, X, Clock, User, GraduationCap, Building, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { LegalModal } from "@/components/LegalModal";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Te rugăm să introduci un email valid");

const strongPasswordSchema = z
  .string()
  .min(8, "Parola trebuie să aibă minim 8 caractere")
  .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
  .regex(/[a-z]/, "Parola trebuie să conțină cel puțin o literă mică")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special");

const loginPasswordSchema = z.string().min(1, "Parola este obligatorie");

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "Minim 8 caractere", test: (p) => p.length >= 8 },
  { label: "O literă mare (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "O literă mică (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "O cifră (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "Un caracter special (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const yearOptions = [
  { value: "1", label: "Anul 1" },
  { value: "2", label: "Anul 2" },
  { value: "3", label: "Anul 3" },
  { value: "4", label: "Anul 4" },
  { value: "5", label: "Anul 5" },
  { value: "6", label: "Anul 6" },
];

interface AuthFormProps {
  isSignUp: boolean;
  setIsSignUp: (value: boolean) => void;
  onFieldFocus: (field: "email" | "password" | null) => void;
  onAuthSuccess?: () => void;
}

export const AuthForm = ({ isSignUp, setIsSignUp, onFieldFocus, onAuthSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy" | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      const { data } = await supabase
        .from('universities')
        .select('id, name, short_name')
        .order('name');
      if (data) setUniversities(data);
    };
    fetchUniversities();
  }, []);

  const { 
    isBlocked, 
    getRemainingAttempts, 
    recordAttempt, 
    resetAttempts,
    formatRemainingTime 
  } = useRateLimiter({
    maxAttempts: 5,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
    storageKey: "auth_rate_limit",
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = isSignUp 
      ? strongPasswordSchema.safeParse(password)
      : loginPasswordSchema.safeParse(password);
      
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        newErrors.fullName = "Numele complet este obligatoriu";
      }
      if (!universityId) {
        newErrors.university = "Te rugăm să selectezi universitatea";
      }
      if (!faculty.trim()) {
        newErrors.faculty = "Facultatea este obligatorie";
      }
      if (!yearOfStudy) {
        newErrors.year = "Te rugăm să selectezi anul de studiu";
      }
      if (!gdprConsent) {
        newErrors.gdpr = "Trebuie să accepți Politica de confidențialitate pentru a continua";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isBlocked()) return;
    if (!recordAttempt()) return;

    setLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password, gdprConsent, {
          fullName: fullName.trim(),
          universityId,
          faculty: faculty.trim(),
          yearOfStudy: parseInt(yearOfStudy),
        })
      : await signIn(email, password);
    setLoading(false);

    if (!error) {
      resetAttempts();
      // Trigger celebration before navigating
      if (onAuthSuccess) {
        onAuthSuccess();
        // Delay navigation to allow celebration animation
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        navigate("/");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            {isSignUp ? "Creează-ți contul" : "Bine ai revenit!"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? "Alătură-te comunității StudyBuddy" 
              : "Te rugăm să introduci datele tale"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemplu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => onFieldFocus("email")}
                onBlur={() => onFieldFocus(null)}
                className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary transition-colors"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => onFieldFocus("password")}
                onBlur={() => onFieldFocus(null)}
                className="pl-11 pr-11 h-12 rounded-xl border-border/50 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            
            {/* Password requirements for signup */}
            {isSignUp && password.length > 0 && (
              <motion.div 
                className="mt-3 p-3 rounded-xl bg-muted/50 space-y-1.5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
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
              </motion.div>
            )}
          </div>

          {/* Signup-only fields */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-5"
            >
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nume complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="ex: Ion Popescu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/50"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              {/* University */}
              <div className="space-y-2">
                <Label htmlFor="university">Universitate</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select value={universityId} onValueChange={setUniversityId}>
                    <SelectTrigger className="pl-11 h-12 rounded-xl border-border/50">
                      <SelectValue placeholder="Selectează universitatea" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>
                          {uni.short_name} - {uni.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.university && <p className="text-xs text-destructive">{errors.university}</p>}
              </div>

              {/* Faculty */}
              <div className="space-y-2">
                <Label htmlFor="faculty">Facultate</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="faculty"
                    type="text"
                    placeholder="ex: Facultatea de Informatică"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/50"
                  />
                </div>
                {errors.faculty && <p className="text-xs text-destructive">{errors.faculty}</p>}
              </div>

              {/* Year of Study */}
              <div className="space-y-2">
                <Label htmlFor="year">Anul de studiu</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                    <SelectTrigger className="pl-11 h-12 rounded-xl border-border/50">
                      <SelectValue placeholder="Selectează anul" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
              </div>

              {/* GDPR Consent */}
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
                    </button>.
                  </Label>
                </div>
                {errors.gdpr && <p className="text-xs text-destructive">{errors.gdpr}</p>}
              </div>
            </motion.div>
          )}

          {/* Login-only options */}
          {!isSignUp && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Ține-mă minte 30 de zile
                </Label>
              </div>
              <Link 
                to="/auth/forgot-password" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Ai uitat parola?
              </Link>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-base"
            disabled={loading || isBlocked()}
          >
            {isBlocked() ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Blocat ({formatRemainingTime()})
              </>
            ) : loading ? (
              "Te rugăm așteaptă..."
            ) : (
              isSignUp ? "Creează Cont" : "Conectează-te"
            )}
          </Button>
          
          {!isBlocked() && getRemainingAttempts() < 5 && (
            <p className="text-xs text-center text-muted-foreground">
              {getRemainingAttempts()} {getRemainingAttempts() === 1 ? "încercare rămasă" : "încercări rămase"}
            </p>
          )}

        </form>

        {/* Switch mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Ai deja cont?" : "Nu ai cont?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-primary hover:underline"
            >
              {isSignUp ? "Conectează-te" : "Înregistrează-te"}
            </button>
          </p>
        </div>
      </motion.div>

      {/* Legal Modals */}
      <LegalModal
        open={legalModalType !== null}
        onOpenChange={(open) => !open && setLegalModalType(null)}
        type={legalModalType || "terms"}
      />
    </div>
  );
};
