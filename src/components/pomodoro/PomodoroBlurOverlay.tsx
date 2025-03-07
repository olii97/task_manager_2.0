
import React from "react";
import { usePomodoro } from "./PomodoroProvider";
import { motion, AnimatePresence } from "framer-motion";

export const PomodoroBlurOverlay: React.FC = () => {
  const { isTimerRunning } = usePomodoro();
  
  if (!isTimerRunning) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 backdrop-blur-lg bg-black/50 pointer-events-none"
      />
    </AnimatePresence>
  );
};
