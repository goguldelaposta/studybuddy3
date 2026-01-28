import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.25,
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade-only variant for modals and overlays
const fadeVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

export function FadeTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={fadeVariants}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale-up variant for cards and dialogs
const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export function ScaleTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={scaleVariants}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide-up variant for bottom sheets
const slideUpVariants = {
  initial: { opacity: 0, y: 50 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
};

export function SlideUpTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={slideUpVariants}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
