import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

interface AnimatedBuddiesProps {
  focusedField: "email" | "password" | null;
  isCelebrating?: boolean;
}

interface BuddyConfig {
  id: number;
  shape: "square" | "blob" | "semicircle";
  color: string;
  size: number;
  position: { x: number; y: number };
}

const buddies: BuddyConfig[] = [
  {
    id: 1,
    shape: "blob",
    color: "#F97316", // Orange
    size: 140,
    position: { x: 25, y: 45 },
  },
  {
    id: 2,
    shape: "square",
    color: "#8B5CF6", // Purple
    size: 130,
    position: { x: 55, y: 40 },
  },
  {
    id: 3,
    shape: "semicircle",
    color: "#FACC15", // Yellow
    size: 120,
    position: { x: 70, y: 70 },
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
      setEyeOffset({ x: 0, y: -3 });
    } else if (focusedField === "password") {
      setIsShying(true);
      setEyeOffset({ x: 0, y: 0 });
    } else if (focusedField === "email") {
      setIsShying(false);
      setEyeOffset({ x: 6, y: 2 });
    } else {
      setIsShying(false);
      if (buddyRef.current && containerRef.current) {
        const rect = buddyRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        const maxOffset = 5;
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

  const springConfig = { stiffness: 120, damping: 20 };
  const eyeX = useSpring(eyeOffset.x, springConfig);
  const eyeY = useSpring(eyeOffset.y, springConfig);

  useEffect(() => {
    eyeX.set(eyeOffset.x);
    eyeY.set(eyeOffset.y);
  }, [eyeOffset.x, eyeOffset.y, eyeX, eyeY]);

  const celebrationVariants = {
    idle: {
      y: 0,
      rotate: 0,
      scale: 1,
    },
    celebrating: {
      y: [0, -25, 0, -15, 0],
      rotate: [0, -8, 8, -4, 0],
      scale: [1, 1.08, 1, 1.05, 1],
      transition: {
        duration: 1,
        ease: "easeInOut" as const,
        delay: config.id * 0.1,
      },
    },
  };

  const renderEyes = () => {
    const eyeSize = config.size * 0.12;
    const pupilSize = eyeSize * 0.55;
    const eyeSpacing = config.size * 0.15;

    // Worried eyes for password field - flat top
    const isWorried = isShying && !isCelebrating;
    const eyeScaleY = isCelebrating ? 0.7 : isWorried ? 0.5 : 1;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex" style={{ gap: eyeSpacing }}>
          {/* Left eye */}
          <motion.div
            className="relative bg-white shadow-sm"
            style={{ 
              width: eyeSize, 
              height: eyeSize,
              borderRadius: isWorried ? "50% 50% 50% 50% / 30% 30% 70% 70%" : "50%",
            }}
            animate={{
              scaleY: eyeScaleY,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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
            className="relative bg-white shadow-sm"
            style={{ 
              width: eyeSize, 
              height: eyeSize,
              borderRadius: isWorried ? "50% 50% 50% 50% / 30% 30% 70% 70%" : "50%",
            }}
            animate={{
              scaleY: eyeScaleY,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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
  };

  const renderShape = () => {
    switch (config.shape) {
      case "square":
        return (
          <div
            className="relative"
            style={{
              width: config.size,
              height: config.size,
              backgroundColor: config.color,
              borderRadius: 24,
            }}
          >
            {renderEyes()}
          </div>
        );
      case "blob":
        return (
          <motion.div
            className="relative"
            style={{
              width: config.size,
              height: config.size * 0.85,
              backgroundColor: config.color,
              borderRadius: "65% 35% 45% 55% / 55% 45% 55% 45%",
            }}
            animate={isCelebrating ? {
              borderRadius: [
                "65% 35% 45% 55% / 55% 45% 55% 45%",
                "45% 55% 35% 65% / 45% 55% 45% 55%",
                "65% 35% 45% 55% / 55% 45% 55% 45%",
              ],
            } : {}}
            transition={{ duration: 0.8, repeat: isCelebrating ? 2 : 0 }}
          >
            {renderEyes()}
          </motion.div>
        );
      case "semicircle":
        return (
          <div
            className="relative"
            style={{
              width: config.size,
              height: config.size * 0.6,
              backgroundColor: config.color,
              borderRadius: `${config.size}px ${config.size}px 20px 20px`,
            }}
          >
            <div className="absolute inset-0 flex items-start justify-center pt-4">
              <div className="flex" style={{ gap: config.size * 0.15 }}>
                {/* Eyes positioned higher for semicircle */}
                <motion.div
                  className="relative bg-white shadow-sm rounded-full"
                  style={{ 
                    width: config.size * 0.12, 
                    height: config.size * 0.12,
                  }}
                  animate={{
                    scaleY: isCelebrating ? 0.7 : isShying ? 0.5 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    className="absolute rounded-full bg-gray-900"
                    style={{
                      width: config.size * 0.065,
                      height: config.size * 0.065,
                      left: "50%",
                      top: "50%",
                      x: eyeX,
                      y: eyeY,
                      marginLeft: -(config.size * 0.065) / 2,
                      marginTop: -(config.size * 0.065) / 2,
                    }}
                  />
                </motion.div>
                <motion.div
                  className="relative bg-white shadow-sm rounded-full"
                  style={{ 
                    width: config.size * 0.12, 
                    height: config.size * 0.12,
                  }}
                  animate={{
                    scaleY: isCelebrating ? 0.7 : isShying ? 0.5 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    className="absolute rounded-full bg-gray-900"
                    style={{
                      width: config.size * 0.065,
                      height: config.size * 0.065,
                      left: "50%",
                      top: "50%",
                      x: eyeX,
                      y: eyeY,
                      marginLeft: -(config.size * 0.065) / 2,
                      marginTop: -(config.size * 0.065) / 2,
                    }}
                  />
                </motion.div>
              </div>
            </div>
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
      initial={{ scale: 0, opacity: 0 }}
      animate={isCelebrating ? "celebrating" : "idle"}
      variants={celebrationVariants}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: config.id * 0.15,
      }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: config.id * 0.15,
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

  useEffect(() => {
    if (isCelebrating && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = (rect.left + rect.width / 2) / window.innerWidth;
      const centerY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: centerX, y: centerY },
        colors: ['#8B5CF6', '#F97316', '#FACC15'],
        ticks: 180,
      });

      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 90,
          origin: { x: centerX - 0.08, y: centerY + 0.1 },
          colors: ['#8B5CF6', '#F97316', '#FACC15'],
          ticks: 120,
        });
        confetti({
          particleCount: 40,
          spread: 90,
          origin: { x: centerX + 0.08, y: centerY + 0.1 },
          colors: ['#8B5CF6', '#F97316', '#FACC15'],
          ticks: 120,
        });
      }, 150);
    }
  }, [isCelebrating]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: "#F3F4F6" }}
    >
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

      {/* Celebration message */}
      {isCelebrating && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
        >
          <div className="bg-white/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-xl font-semibold text-gray-900">
              🎉 Welcome!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
