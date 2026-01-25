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
        className="lg:hidden h-48 relative overflow-hidden flex items-center justify-center gap-5"
        style={{ backgroundColor: "#F3F4F6" }}
      >
        {/* Orange Blob Buddy */}
        <div 
          className="relative w-20 h-16 flex items-center justify-center"
          style={{ 
            backgroundColor: "#F97316", 
            borderRadius: "65% 35% 45% 55% / 55% 45% 55% 45%",
          }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
            </div>
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Purple Square Buddy */}
        <div 
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "#8B5CF6" }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
            </div>
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Yellow Semicircle Buddy */}
        <div 
          className="relative w-14 h-10 flex items-start justify-center pt-2"
          style={{ 
            backgroundColor: "#FACC15",
            borderRadius: "56px 56px 8px 8px",
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-1 h-1 bg-gray-900 rounded-full" />
            </div>
            <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-1 h-1 bg-gray-900 rounded-full" />
            </div>
          </div>
        </div>
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
