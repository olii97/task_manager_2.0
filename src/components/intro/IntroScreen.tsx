import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { Rocket } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

// Generate random positions for the rockets
const generateRocketPositions = (count: number) => {
  const positions = [];
  
  // Additional left-side rockets (add 3 more on the left)
  for (let i = 0; i < 3; i++) {
    // Left side rockets between 5% and 30% from the left
    const xPosition = Math.random() * 25 + 5; // 5% to 30% from left
    
    // Vertical position starts below the screen
    const yPosition = Math.random() * 20 + 100; // 100% to 120% from top
    
    // Slight random rotation
    const rotation = (Math.random() * 20) - 10; // -10° to +10°
    
    // Size variation
    const size = Math.random() * 0.5 + 0.7; // 0.7x to 1.2x base size
    
    // Launch delay
    const delay = Math.random() * 0.5;
    
    positions.push({
      x: xPosition,
      y: yPosition,
      rotation,
      size,
      delay
    });
  }
  
  // Additional right-side rockets (add 3 more on the right)
  for (let i = 0; i < 3; i++) {
    // Right side rockets between 70% and 95% from the left
    const xPosition = Math.random() * 25 + 70; // 70% to 95% from left
    
    // Vertical position starts below the screen
    const yPosition = Math.random() * 20 + 100; // 100% to 120% from top
    
    // Slight random rotation
    const rotation = (Math.random() * 20) - 10; // -10° to +10°
    
    // Size variation
    const size = Math.random() * 0.5 + 0.7; // 0.7x to 1.2x base size
    
    // Launch delay
    const delay = Math.random() * 0.5;
    
    positions.push({
      x: xPosition,
      y: yPosition,
      rotation,
      size,
      delay
    });
  }
  
  // Distributed rockets on both sides
  for (let i = 0; i < count; i++) {
    // Determine if this rocket will be on the left or right side (avoiding the middle)
    const isLeftSide = Math.random() > 0.5; // Even distribution now that we have dedicated rockets
    
    // For left side rockets, position them between 10% and 30% from the left
    // For right side rockets, position them between 70% and 90% from the left
    const xPosition = isLeftSide 
      ? Math.random() * 20 + 10 // 10% to 30% from left
      : Math.random() * 20 + 70; // 70% to 90% from left
    
    // Vertical position starts below the screen
    const yPosition = Math.random() * 20 + 100; // 100% to 120% from top
    
    // Slight random rotation
    const rotation = (Math.random() * 20) - 10; // -10° to +10°
    
    // Size variation
    const size = Math.random() * 0.5 + 0.7; // 0.7x to 1.2x base size
    
    // Launch delay
    const delay = Math.random() * 0.5;
    
    positions.push({
      x: xPosition,
      y: yPosition,
      rotation,
      size,
      delay
    });
  }
  
  return positions;
};

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const { session } = useAuth();
  const [showButton, setShowButton] = useState(false);
  const [isRocketsLaunching, setIsRocketsLaunching] = useState(false);
  const userName = session?.user?.user_metadata?.name || 'there';
  
  // Generate 7 random rocket positions
  const rocketPositions = React.useMemo(() => generateRocketPositions(7), []);
  
  // Show the button after the text animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000); // 3 seconds after component mounts
    
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Trigger rocket animation before completing
    setIsRocketsLaunching(true);
    
    // Complete after rocket animation starts
    setTimeout(() => {
      onComplete();
    }, 1000); // Allow some time for the rocket animation to be visible
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 to-blue-800 z-50"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Multiple animated rockets */}
        {rocketPositions.map((position, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `${position.x}%`,
              bottom: `-50px`, // Start below the screen
            }}
            initial={{ 
              y: 0, 
              opacity: 0,
              rotate: position.rotation
            }}
            animate={{ 
              y: isRocketsLaunching ? -2000 : -position.y * 5, // fly higher if launching
              opacity: isRocketsLaunching ? 0 : 0.8,
              scale: isRocketsLaunching ? 0.2 : position.size,
            }}
            transition={{ 
              y: { 
                duration: 3 + position.delay, 
                ease: [0.4, 0, 0.2, 1],
                delay: position.delay,
                repeat: isRocketsLaunching ? 0 : Infinity,
                repeatType: "reverse"
              },
              opacity: { 
                duration: 1, 
                delay: position.delay
              },
              scale: { 
                duration: 1.5,
                delay: position.delay 
              }
            }}
          >
            <Rocket 
              className="text-yellow-300" 
              style={{ 
                height: `${4 * position.size}rem`,
                width: `${4 * position.size}rem`,
              }}
            />
          </motion.div>
        ))}
        
        <div className="text-center px-6 max-w-2xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Good day, {userName}.
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            Are you ready to take off and make an amazing day?
          </motion.p>
          
          <AnimatePresence>
            {showButton && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-blue-900 hover:bg-blue-100 font-semibold text-lg px-8 py-6"
                  onClick={handleGetStarted}
                >
                  Let's Get Started
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroScreen; 