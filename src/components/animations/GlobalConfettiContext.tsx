import React, { createContext, useContext, useState, useRef } from 'react';
import { ConfettiEffect } from './ConfettiEffect';

// Define context type
interface GlobalConfettiContextType {
  showConfetti: (options?: {
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
  }) => void;
}

// Create context with default value
const GlobalConfettiContext = createContext<GlobalConfettiContextType>({
  showConfetti: () => {},
});

// Custom hook to use the confetti context
export const useConfetti = () => {
  return useContext(GlobalConfettiContext);
};

// Provider component
export const GlobalConfettiProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Track active state and particle count
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [particleCount, setParticleCount] = useState(200);
  const [confettiSource, setConfettiSource] = useState({
    x: 0,
    y: 0,
    width: 0
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // Function to trigger confetti
  const showConfetti = (options?: {
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
  }) => {
    // If already showing, don't restart
    if (isConfettiActive) return;
    
    // Clear any existing timers to be safe
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    
    // Store the source position if provided
    if (options) {
      setConfettiSource({
        x: options.sourceX || 0,
        y: options.sourceY || 0,
        width: options.sourceWidth || 0
      });
    }
    
    // Reset particle count and show confetti
    setParticleCount(200);
    setIsConfettiActive(true);
    
    // Start fading out after 2 seconds by gradually reducing particles
    fadeTimerRef.current = setTimeout(() => {
      // Gradually reduce particles to create a fade-out effect
      const fadeInterval = setInterval(() => {
        setParticleCount((prev) => {
          // Once we reach a low number, clear the interval and stop
          if (prev <= 40) {
            clearInterval(fadeInterval);
            
            // After the last few particles, finally hide the effect
            timerRef.current = setTimeout(() => {
              setIsConfettiActive(false);
            }, 1000);
            
            return 20; // Final reduced particles to let animation finish
          }
          return prev - 25; // Reduce particles faster
        });
      }, 400); // Reduce particles every 400ms
    }, 2500);
  };

  return (
    <GlobalConfettiContext.Provider value={{ showConfetti }}>
      {/* The full-screen confetti effect with dynamic particle count */}
      {isConfettiActive && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[9999]">
          <ConfettiEffect 
            isActive={true} 
            particleCount={particleCount}
            sourcePosition={confettiSource}
          />
        </div>
      )}
      
      {/* Render children */}
      {children}
    </GlobalConfettiContext.Provider>
  );
}; 