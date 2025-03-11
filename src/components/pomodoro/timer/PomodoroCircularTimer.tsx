
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

  return (
    <div className="w-48 h-48 mx-auto mb-4">
      <CircularProgressbar
        value={calculateProgress()}
        text={formatTime(timeRemaining)}
        styles={buildStyles({
          textSize: '16px',
          pathColor: isBreak ? '#B5A7F2' : '#E63946',
          textColor: isBreak ? '#B5A7F2' : '#E63946',
          trailColor: 'rgba(255, 255, 255, 0.2)',
          pathTransition: 'stroke-dashoffset 0.5s ease 0s',
        })}
      />
    </div>
  );
};
