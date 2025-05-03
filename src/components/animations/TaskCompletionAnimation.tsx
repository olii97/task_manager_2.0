import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiEffect } from "./ConfettiEffect";

interface TaskCompletionAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
  forceShow?: boolean;
}

export const TaskCompletionAnimation = ({ 
  isActive, 
  onComplete,
  forceShow = false
}: TaskCompletionAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasBeenTriggered = useRef(false);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  // Manage animation visibility
  useEffect(() => {
    if (isVisible) return;
    
    if (forceShow || (isActive && !hasBeenTriggered.current)) {
      hasBeenTriggered.current = true;
      setIsVisible(true);
      
      // Schedule animation to end - shorter duration
      animationTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        
        // Wait for exit animation to complete before calling onComplete
        completionTimerRef.current = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 500);
        
      }, 2500); // Short but enough time to be visible
    }
  }, [isActive, onComplete, forceShow, isVisible]);

  return (
    <>
      {/* Full screen confetti effect */}
      {isVisible && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[9000]">
          <ConfettiEffect 
            isActive={true} 
            particleCount={100} 
          />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key="completion-animation"
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.4, y: 30 }}
              animate={{ 
                scale: [0.4, 1.2, 1],
                y: [30, -20, 0]
              }}
              exit={{ 
                scale: 0.8,
                opacity: 0,
                y: -10
              }}
              transition={{
                duration: 1.0,
                times: [0, 0.6, 1],
                ease: "easeOut"
              }}
            >
              <span className="text-5xl font-bold text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                +20 XP
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskCompletionAnimation; 