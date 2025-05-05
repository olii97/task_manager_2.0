import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTaskTicker } from '@/contexts/TaskTickerContext';

interface TickerMessage {
  id: string;
  text: string;
  timestamp: number;
}

interface TaskTickerProps {
  className?: string;
}

export function TaskTicker({ className }: TaskTickerProps) {
  const { messages } = useTaskTicker();
  const [currentIndex, setCurrentIndex] = useState(0);
  const tickerContainerRef = useRef<HTMLDivElement>(null);

  // Cycle through messages
  useEffect(() => {
    if (messages.length === 0) return;

    // Ensure current index is valid
    if (currentIndex >= messages.length) {
      setCurrentIndex(0);
    }
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, 5000); // Show each message for 5 seconds

    return () => clearInterval(interval);
  }, [messages.length, currentIndex]);

  // Always render the ticker, even if empty
  return (
    <div 
      ref={tickerContainerRef}
      className={cn(
        "w-full h-10 border border-gray-200 rounded-md bg-gray-50 overflow-hidden flex items-center",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {messages.length > 0 ? (
          <motion.div
            key={messages[currentIndex]?.id}
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            exit={{ opacity: 0 }}
            transition={{ 
              x: { 
                duration: 10, 
                ease: "linear" 
              },
              opacity: { duration: 0.5 }
            }}
            className="whitespace-nowrap px-4 font-medium text-gray-700 tracking-wider"
          >
            {messages[currentIndex]?.text}
          </motion.div>
        ) : (
          <motion.div
            key="empty-ticker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="whitespace-nowrap px-4 font-medium text-gray-500 tracking-wider"
          >
            WAITING FOR TASK UPDATES...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 