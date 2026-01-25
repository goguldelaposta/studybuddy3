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
    <div className="min-h-screen flex">
      {/* Left side - Animated Buddies */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%]">
        <AnimatedBuddies focusedField={focusedField} isCelebrating={isCelebrating} />
      </div>

      {/* Mobile header with mini buddies */}
      <div 
        className="lg:hidden h-40 relative overflow-hidden flex items-center justify-center gap-6"
        style={{ backgroundColor: "#F3F4F6" }}
      >
        <div 
          className="w-16 h-14 rounded-[12px]"
          style={{ 
            backgroundColor: "#F97316", 
            borderRadius: "65% 35% 45% 55% / 55% 45% 55% 45%",
          }}
        />
        <div 
          className="w-14 h-14 rounded-[16px]"
          style={{ backgroundColor: "#8B5CF6" }}
        />
        <div 
          className="w-12 h-8"
          style={{ 
            backgroundColor: "#FACC15",
            borderRadius: "48px 48px 8px 8px",
          }}
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 lg:w-1/2 xl:w-[55%] flex items-center justify-center p-8 lg:p-12 bg-white">
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
