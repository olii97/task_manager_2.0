
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingXPProps {
  amount: number;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export const FloatingXP = ({ amount, position, onComplete }: FloatingXPProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, x: position.x, scale: 0.8 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            y: [0, -15, -30, -50], 
            scale: [0.8, 1.2, 1, 0.8] 
          }}
          transition={{ 
            duration: 1.5,
            times: [0, 0.1, 0.8, 1],
            ease: "easeOut" 
          }}
          className="text-xl font-bold text-yellow-400 drop-shadow-md pointer-events-none absolute z-50"
          style={{ left: position.x, top: position.y }}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
};
