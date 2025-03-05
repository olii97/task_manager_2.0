
import React from "react";
import { usePomodoro } from "./PomodoroProvider";
import { motion, AnimatePresence } from "framer-motion";

export const PomodoroBlurOverlay: React.FC = () => {
  const { state, isActive } = usePomodoro();
  
  if (!isActive) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 pointer-events-none"
      />
    </AnimatePresence>
  );
};
