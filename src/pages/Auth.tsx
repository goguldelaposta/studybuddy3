import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthForm } from "@/components/auth/AuthForm";
import { Users } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ 
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))'
      }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/60 backdrop-blur-sm z-10" />
      
      <div className="w-full max-w-md relative z-20">
        {/* Logo/Icon */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users className="w-7 h-7 text-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isSignUp ? "Creează-ți contul" : "Bine ai revenit"}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {isSignUp ? "Alătură-te comunității StudyBuddy" : "Conectează-te pentru a continua"}
          </p>
        </motion.div>
        
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
