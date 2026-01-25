import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Users } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="group relative">
          {/* Glow border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-sm transition-all duration-500" />
          
          {/* Main card */}
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 transition-all duration-300 group-hover:border-cyan-500/30 group-hover:shadow-cyan-500/10 group-hover:shadow-xl">
            {/* Logo/Icon with glow */}
            <div className="flex justify-center mb-6">
              <div className="relative group/icon">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl blur-lg opacity-50 group-hover/icon:opacity-75 transition-opacity duration-300" />
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center transform transition-transform duration-300 hover:scale-105 hover:rotate-3">
                  <Users className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
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
    </div>
  );
};

export default Auth;
