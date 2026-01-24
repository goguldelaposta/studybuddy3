import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatedBuddies } from "@/components/auth/AnimatedBuddies";
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleAuthSuccess = () => {
    setIsCelebrating(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Animated Buddies */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%]">
        <AnimatedBuddies focusedField={focusedField} isCelebrating={isCelebrating} />
      </div>

      {/* Mobile header with mini buddies preview */}
      <div className="lg:hidden h-32 relative overflow-hidden bg-gradient-to-br from-violet-100 via-orange-50 to-yellow-100 dark:from-violet-950/50 dark:via-orange-950/30 dark:to-yellow-950/30">
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          <div 
            className="w-12 h-12 rounded-full"
            style={{ backgroundColor: "hsl(265, 89%, 66%)" }}
          />
          <div 
            className="w-10 h-8 rounded-xl"
            style={{ backgroundColor: "hsl(32, 95%, 60%)", transform: "rotate(15deg)" }}
          />
          <div 
            className="w-9 h-9 rounded-full"
            style={{ backgroundColor: "hsl(48, 96%, 53%)" }}
          />
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 lg:w-1/2 xl:w-[55%] flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <AuthForm 
          isSignUp={isSignUp} 
          setIsSignUp={setIsSignUp}
          onFieldFocus={setFocusedField}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};

export default Auth;
