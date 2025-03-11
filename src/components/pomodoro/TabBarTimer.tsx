
import React from "react";
import { usePomodoro } from "./PomodoroProvider";

/**
 * TabBarTimer doesn't need to manage its own timer anymore
 * since the main timer will update the document title.
 * This is now just a placeholder component for future enhancements.
 */
export const TabBarTimer: React.FC = () => {
  // This component no longer needs to do anything as the main timer
  // in usePomodoroTimer now handles the document.title updates
  return null;
};
