
import React, { useEffect } from "react";
import { usePomodoro } from "./PomodoroProvider";

/**
 * TabBarTimer updates the document title with the current timer status.
 * This component doesn't render anything but updates the browser tab
 * to show the timer progress.
 */
export const TabBarTimer: React.FC = () => {
  const { isTimerRunning, timerSettings, selectedTask } = usePomodoro();
  
  // For tab bar display, we need to monitor the timer state
  useEffect(() => {
    // This effect manages the document.title updates
    if (!isTimerRunning) {
      // If timer isn't running, we don't need to do anything
      return;
    }
    
    const originalTitle = document.title;
    let countdown = timerSettings.workDuration * 60;
    let isBreak = false;
    
    const intervalId = setInterval(() => {
      if (countdown <= 0) {
        // Reset timer when it reaches zero
        if (isBreak) {
          // If a break ended, go back to work mode
          countdown = timerSettings.workDuration * 60;
          isBreak = false;
        } else {
          // If work ended, go to break mode
          countdown = timerSettings.breakDuration * 60;
          isBreak = true;
        }
      } else {
        countdown--;
      }
      
      // Format time for display in tab
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Update the document title
      const mode = isBreak ? "Break" : "Focus";
      document.title = `${formattedTime} | ${mode} - Reflect`;
    }, 1000);
    
    // Cleanup function to clear interval and restore original title
    return () => {
      clearInterval(intervalId);
      document.title = originalTitle;
    };
  }, [isTimerRunning, timerSettings, selectedTask]);
  
  // This component doesn't render anything
  return null;
};
