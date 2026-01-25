import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Users } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
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
  );
};

export default Auth;
