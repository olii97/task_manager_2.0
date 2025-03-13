import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { Rocket } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const { session } = useAuth();
  const [showButton, setShowButton] = useState(false);
  const [isRocketLaunching, setIsRocketLaunching] = useState(false);
  const userName = session?.user?.user_metadata?.name || 'there';
  
  // Show the button after the text animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000); // 3 seconds after component mounts
    
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Trigger rocket animation before completing
    setIsRocketLaunching(true);
    
    // Complete after rocket animation starts
    setTimeout(() => {
      onComplete();
    }, 1000); // Allow some time for the rocket animation to be visible
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 flex flex-col items-center justify-center bg-dark-gradient z-50"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Animated Rocket */}
        <motion.div
          className="absolute"
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: isRocketLaunching ? -1000 : 0,
            opacity: isRocketLaunching ? 0 : 1,
            scale: isRocketLaunching ? 0.5 : 1 
          }}
          transition={{ 
            y: { duration: 1.5, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 1.2 },
            scale: { duration: 1.5 }
          }}
        >
          <Rocket className="h-16 w-16 text-yellow-300 transform rotate-0" />
        </motion.div>
        
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