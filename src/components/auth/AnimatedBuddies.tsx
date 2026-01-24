import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

interface AnimatedBuddiesProps {
  focusedField: "email" | "password" | null;
  isCelebrating?: boolean;
}

interface BuddyConfig {
  id: number;
  shape: "blob" | "rectangle" | "circle";
  color: string;
  size: number;
  position: { x: number; y: number };
  rotation: number;
}

const buddies: BuddyConfig[] = [
  {
    id: 1,
    shape: "blob",
    color: "hsl(265, 89%, 66%)", // Purple
    size: 120,
    position: { x: 20, y: 25 },
    rotation: 0,
  },
  {
    id: 2,
    shape: "rectangle",
    color: "hsl(32, 95%, 60%)", // Orange
    size: 100,
    position: { x: 60, y: 15 },
    rotation: 15,
  },
  {
    id: 3,
    shape: "circle",
    color: "hsl(48, 96%, 53%)", // Yellow
    size: 90,
    position: { x: 35, y: 60 },
    rotation: -10,
  },
  {
    id: 4,
    shape: "blob",
    color: "hsl(280, 75%, 55%)", // Violet
    size: 80,
    position: { x: 70, y: 55 },
    rotation: 25,
  },
];

const Buddy = ({
  config,
  mouseX,
  mouseY,
  containerRef,
  focusedField,
  isCelebrating,
}: {
  config: BuddyConfig;
  mouseX: number;
  mouseY: number;
  containerRef: React.RefObject<HTMLDivElement>;
  focusedField: "email" | "password" | null;
  isCelebrating: boolean;
}) => {
  const buddyRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isShying, setIsShying] = useState(false);

  useEffect(() => {
    if (isCelebrating) {
      setIsShying(false);
      // Happy eyes looking up during celebration
      setEyeOffset({ x: 0, y: -3 });
    } else if (focusedField === "password") {
      setIsShying(true);
      setEyeOffset({ x: 0, y: 8 });
    } else if (focusedField === "email") {
      setIsShying(false);
      // Look towards right side (where the form is)
      setEyeOffset({ x: 6, y: 2 });
    } else {
      setIsShying(false);
      // Follow mouse
      if (buddyRef.current && containerRef.current) {
        const rect = buddyRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        const maxOffset = 6;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedX = distance > 0 ? (deltaX / distance) * maxOffset : 0;
        const normalizedY = distance > 0 ? (deltaY / distance) * maxOffset : 0;

        setEyeOffset({
          x: Math.max(-maxOffset, Math.min(maxOffset, normalizedX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, normalizedY)),
        });
      }
    }
  }, [mouseX, mouseY, focusedField, containerRef, isCelebrating]);

  const springConfig = { stiffness: 150, damping: 15 };
  const eyeX = useSpring(eyeOffset.x, springConfig);
  const eyeY = useSpring(eyeOffset.y, springConfig);

  useEffect(() => {
    eyeX.set(eyeOffset.x);
    eyeY.set(eyeOffset.y);
  }, [eyeOffset.x, eyeOffset.y, eyeX, eyeY]);

  // Celebration animation variants
  const celebrationVariants = {
    idle: {
      y: 0,
      rotate: config.rotation,
      scale: 1,
    },
    celebrating: {
      y: [0, -30, 0, -20, 0, -10, 0],
      rotate: [config.rotation, config.rotation - 15, config.rotation + 15, config.rotation - 10, config.rotation + 10, config.rotation],
      scale: [1, 1.1, 1, 1.08, 1, 1.05, 1],
      transition: {
        duration: 1.2,
        ease: "easeInOut" as const,
        times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
        delay: config.id * 0.1,
      },
    },
  };

  const renderShape = () => {
    const eyeSize = config.size * 0.15;
    const pupilSize = eyeSize * 0.5;
    const eyeSpacing = config.size * 0.2;

    // Happy squinted eyes during celebration
    const eyeScaleY = isCelebrating ? 0.6 : isShying ? 0.1 : 1;

    const eyes = (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-2" style={{ gap: eyeSpacing }}>
          {/* Left eye */}
          <motion.div
            className="relative rounded-full bg-white shadow-inner"
            style={{ width: eyeSize, height: eyeSize }}
            animate={{
              scaleY: eyeScaleY,
              borderRadius: isCelebrating ? "50% 50% 50% 50%" : "50%",
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute rounded-full bg-gray-900"
              style={{
                width: pupilSize,
                height: pupilSize,
                left: "50%",
                top: "50%",
                x: eyeX,
                y: eyeY,
                marginLeft: -pupilSize / 2,
                marginTop: -pupilSize / 2,
              }}
            />
          </motion.div>
          {/* Right eye */}
          <motion.div
            className="relative rounded-full bg-white shadow-inner"
            style={{ width: eyeSize, height: eyeSize }}
            animate={{
              scaleY: eyeScaleY,
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute rounded-full bg-gray-900"
              style={{
                width: pupilSize,
                height: pupilSize,
                left: "50%",
                top: "50%",
                x: eyeX,
                y: eyeY,
                marginLeft: -pupilSize / 2,
                marginTop: -pupilSize / 2,
              }}
            />
          </motion.div>
        </div>
        
        {/* Happy mouth during celebration */}
        {isCelebrating && (
          <motion.div
            className="absolute"
            style={{
              bottom: config.size * 0.2,
              width: config.size * 0.25,
              height: config.size * 0.12,
              borderRadius: "0 0 50% 50%",
              backgroundColor: "rgba(0,0,0,0.15)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );

    // Hand/cover for shy mode
    const coverHands = isShying && !isCelebrating && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div 
          className="rounded-full"
          style={{ 
            width: config.size * 0.5,
            height: config.size * 0.15,
            backgroundColor: config.color,
            filter: "brightness(0.85)",
            marginTop: config.size * 0.05,
          }}
        />
      </motion.div>
    );

    switch (config.shape) {
      case "blob":
        return (
          <motion.div
            className="relative"
            style={{
              width: config.size,
              height: config.size,
              backgroundColor: config.color,
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            }}
            animate={isCelebrating ? {
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "40% 60% 70% 30% / 30% 70% 40% 60%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              ],
            } : {}}
            transition={{ duration: 0.8, repeat: isCelebrating ? 2 : 0 }}
          >
            {eyes}
            {coverHands}
          </motion.div>
        );
      case "rectangle":
        return (
          <div
            className="relative"
            style={{
              width: config.size,
              height: config.size * 0.8,
              backgroundColor: config.color,
              borderRadius: 24,
            }}
          >
            {eyes}
            {coverHands}
          </div>
        );
      case "circle":
        return (
          <div
            className="relative rounded-full"
            style={{
              width: config.size,
              height: config.size,
              backgroundColor: config.color,
            }}
          >
            {eyes}
            {coverHands}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={buddyRef}
      className="absolute"
      style={{
        left: `${config.position.x}%`,
        top: `${config.position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
      initial={{ scale: 0, opacity: 0, y: 0 }}
      animate={isCelebrating ? "celebrating" : "idle"}
      variants={celebrationVariants}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: config.id * 0.1,
      }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: config.id * 0.1,
        }}
      >
        {renderShape()}
      </motion.div>
    </motion.div>
  );
};

export const AnimatedBuddies = ({ focusedField, isCelebrating = false }: AnimatedBuddiesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Trigger confetti when celebrating
  useEffect(() => {
    if (isCelebrating && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = (rect.left + rect.width / 2) / window.innerWidth;
      const centerY = (rect.top + rect.height / 2) / window.innerHeight;

      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: centerX, y: centerY },
        colors: ['#8B5CF6', '#F97316', '#FACC15', '#A855F7'],
        ticks: 200,
      });

      // Second burst with delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { x: centerX - 0.1, y: centerY + 0.1 },
          colors: ['#8B5CF6', '#F97316', '#FACC15', '#A855F7'],
          ticks: 150,
        });
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { x: centerX + 0.1, y: centerY + 0.1 },
          colors: ['#8B5CF6', '#F97316', '#FACC15', '#A855F7'],
          ticks: 150,
        });
      }, 200);

      // Stars burst
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 360,
          startVelocity: 30,
          origin: { x: centerX, y: centerY },
          shapes: ['star'],
          colors: ['#FFD700', '#FFA500', '#FF6347'],
          ticks: 100,
        });
      }, 400);
    }
  }, [isCelebrating]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-violet-100 via-orange-50 to-yellow-100 dark:from-violet-950/50 dark:via-orange-950/30 dark:to-yellow-950/30 overflow-hidden"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-200/40 dark:bg-purple-800/20 blur-3xl"
          animate={isCelebrating ? { scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] } : {}}
          transition={{ duration: 1, repeat: isCelebrating ? 2 : 0 }}
        />
        <motion.div 
          className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-orange-200/40 dark:bg-orange-800/20 blur-3xl"
          animate={isCelebrating ? { scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] } : {}}
          transition={{ duration: 1.2, repeat: isCelebrating ? 2 : 0, delay: 0.1 }}
        />
        <motion.div 
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-yellow-200/40 dark:bg-yellow-800/20 blur-3xl"
          animate={isCelebrating ? { scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] } : {}}
          transition={{ duration: 0.8, repeat: isCelebrating ? 2 : 0, delay: 0.2 }}
        />
      </div>

      {/* Animated buddies */}
      {buddies.map((buddy) => (
        <Buddy
          key={buddy.id}
          config={buddy}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          containerRef={containerRef}
          focusedField={focusedField}
          isCelebrating={isCelebrating}
        />
      ))}

      {/* Celebration text */}
      {isCelebrating && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl">
            <p className="text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-orange-500 to-yellow-500">
              🎉 Bine ai venit!
            </p>
          </div>
        </motion.div>
      )}

      {/* Branding */}
      <div className="absolute bottom-8 left-8 right-8 text-center">
        <motion.h2
          className="text-2xl font-display font-bold text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          StudyBuddy
        </motion.h2>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Găsește parteneri de studiu
        </motion.p>
      </div>
    </div>
  );
};
