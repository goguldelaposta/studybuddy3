import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Users } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? "Creează-ți contul" : "Bine ai revenit"}
          </h1>
          <p className="text-gray-500">
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
  );
};

export default Auth;
