
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types/tasks";

interface NewTaskAnimationProps {
  task: Task;
  isVisible: boolean;
  onComplete: () => void;
}

export const NewTaskAnimation = ({ task, isVisible, onComplete }: NewTaskAnimationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: [0.9, 1.1, 1],
            boxShadow: [
              "0 0 0 rgba(59, 130, 246, 0)",
              "0 0 20px rgba(59, 130, 246, 0.5)",
              "0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            duration: 1.5,
            times: [0, 0.5, 1],
            ease: "easeOut" 
          }}
          className="relative rounded-md p-4 bg-white border border-blue-200 mb-2"
        >
          <div className="font-medium">{task.title}</div>
          {task.description && (
            <div className="text-sm text-gray-500 mt-1">{task.description}</div>
          )}
          <div className="absolute inset-0 rounded-md pointer-events-none"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
