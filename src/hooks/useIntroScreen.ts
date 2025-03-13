import { useState, useEffect } from 'react';

// Key for localStorage
const INTRO_SCREEN_SHOWN_KEY = 'intro_screen_shown';

export const useIntroScreen = () => {
  // Check if the intro screen has been shown before
  const [showIntroScreen, setShowIntroScreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage to see if the intro screen has been shown before
    const hasShownBefore = localStorage.getItem(INTRO_SCREEN_SHOWN_KEY) === 'true';
    
    // Only show the intro screen if it hasn't been shown before
    setShowIntroScreen(!hasShownBefore);
    setIsLoading(false);
  }, []);

  // Function to mark the intro screen as completed
  const completeIntroScreen = () => {
    localStorage.setItem(INTRO_SCREEN_SHOWN_KEY, 'true');
    setShowIntroScreen(false);
  };

  // Function to reset the intro screen (for testing)
  const resetIntroScreen = () => {
    localStorage.removeItem(INTRO_SCREEN_SHOWN_KEY);
    setShowIntroScreen(true);
  };

  return {
    showIntroScreen,
    isLoading,
    completeIntroScreen,
    resetIntroScreen
  };
}; 