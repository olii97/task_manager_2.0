
import React from "react";
import { usePomodoro } from "./PomodoroProvider";

/**
 * TabBarTimer doesn't need to manage its own timer anymore
 * since the main timer will update the document title.
 * This component ensures the title is properly reset when not in a pomodoro session.
 */
export const TabBarTimer: React.FC = () => {
  const { isTimerRunning } = usePomodoro();
  
  React.useEffect(() => {
    // Reset the document title when not in a pomodoro session
    if (!isTimerRunning) {
      document.title = "Launchpad";
    }
    
    return () => {
      document.title = "Launchpad";
    };
  }, [isTimerRunning]);
  
  return null;
};
