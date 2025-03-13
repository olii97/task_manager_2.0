
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface PomodoroCircularTimerProps {
  timeRemaining: number;
  originalDuration: number;
  isBreak: boolean;
  formatTime: (seconds: number) => string;
}

export const PomodoroCircularTimer: React.FC<PomodoroCircularTimerProps> = ({
  timeRemaining,
  originalDuration,
  isBreak,
  formatTime,
}) => {
  const calculateProgress = (): number => {
    if (originalDuration === 0) return 0;
    return (timeRemaining / originalDuration) * 100;
  };

  // Define gradient colors based on break or work mode
  const pathColor = isBreak 
    ? '#B5A7F2' // Lavender for break
    : '#E63946'; // Red for focus

  const textColor = isBreak 
    ? '#9B8DED' // Slightly darker lavender for text
    : '#D93545'; // Slightly darker red for text
    
  const trailColor = 'rgba(255, 255, 255, 0.25)';

  return (
    <div className="w-56 h-56 mx-auto mb-4 drop-shadow-lg">
      <CircularProgressbar
        value={calculateProgress()}
        text={formatTime(timeRemaining)}
        styles={buildStyles({
          textSize: '16px',
          pathColor: pathColor,
          textColor: textColor,
          trailColor: trailColor,
          pathTransition: 'stroke-dashoffset 0.5s ease 0s',
          // Add rotation to start from the top
          rotation: 0.25,
        })}
      />
    </div>
  );
};
