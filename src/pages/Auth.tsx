import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Users } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#0d1526] to-[#0a0a1a] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0d1526]/80 backdrop-blur-sm rounded-2xl p-8 border border-white/5">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? "Creează-ți contul" : "Bine ai revenit"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? "Alătură-te comunității StudyBuddy" : "Conectează-te pentru a continua"}
            </p>
          </div>
          
          <AuthForm 
            isSignUp={isSignUp} 
            setIsSignUp={setIsSignUp}
            onFieldFocus={() => {}}
            onAuthSuccess={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
