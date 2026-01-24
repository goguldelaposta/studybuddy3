import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedBuddiesProps {
  focusedField: "email" | "password" | null;
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
}: {
  config: BuddyConfig;
  mouseX: number;
  mouseY: number;
  containerRef: React.RefObject<HTMLDivElement>;
  focusedField: "email" | "password" | null;
}) => {
  const buddyRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isShying, setIsShying] = useState(false);

  useEffect(() => {
    if (focusedField === "password") {
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
  }, [mouseX, mouseY, focusedField, containerRef]);

  const springConfig = { stiffness: 150, damping: 15 };
  const eyeX = useSpring(eyeOffset.x, springConfig);
  const eyeY = useSpring(eyeOffset.y, springConfig);

  useEffect(() => {
    eyeX.set(eyeOffset.x);
    eyeY.set(eyeOffset.y);
  }, [eyeOffset.x, eyeOffset.y, eyeX, eyeY]);

  const renderShape = () => {
    const eyeSize = config.size * 0.15;
    const pupilSize = eyeSize * 0.5;
    const eyeSpacing = config.size * 0.2;

    const eyes = (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-2" style={{ gap: eyeSpacing }}>
          {/* Left eye */}
          <motion.div
            className="relative rounded-full bg-white shadow-inner"
            style={{ width: eyeSize, height: eyeSize }}
            animate={{
              scaleY: isShying ? 0.1 : 1,
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
              scaleY: isShying ? 0.1 : 1,
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
      </div>
    );

    // Hand/cover for shy mode
    const coverHands = isShying && (
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
          <div
            className="relative"
            style={{
              width: config.size,
              height: config.size,
              backgroundColor: config.color,
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            }}
          >
            {eyes}
            {coverHands}
          </div>
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
        transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotate: isShying ? config.rotation + (Math.random() > 0.5 ? 10 : -10) : config.rotation,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: config.id * 0.1,
      }}
      whileHover={{ scale: 1.05 }}
    >
      {renderShape()}
    </motion.div>
  );
};

export const AnimatedBuddies = ({ focusedField }: AnimatedBuddiesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-violet-100 via-orange-50 to-yellow-100 dark:from-violet-950/50 dark:via-orange-950/30 dark:to-yellow-950/30 overflow-hidden"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-200/40 dark:bg-purple-800/20 blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-orange-200/40 dark:bg-orange-800/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-yellow-200/40 dark:bg-yellow-800/20 blur-3xl" />
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
        />
      ))}

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
