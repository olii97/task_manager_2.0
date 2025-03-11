
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, StopCircle, AlertTriangle } from "lucide-react";
import { PomodoroStatus } from "@/types/pomodoro";

interface PomodoroControlsProps {
  status: PomodoroStatus;
  isBreak: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onLogDistraction: () => void;
}

export const PomodoroControls: React.FC<PomodoroControlsProps> = ({
  status,
  isBreak,
  onPause,
  onResume,
  onStop,
  onLogDistraction,
}) => {
  const buttonColor = isBreak ? "meditation-primary" : "pomodoro-primary";
  
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex gap-3 justify-center">
        {status === "running" ? (
          <Button
            variant="outline"
            size="icon"
            className={`h-12 w-12 rounded-full border-2 border-${buttonColor} text-${buttonColor} hover:bg-${buttonColor}/10 transition-all duration-200 shadow-md`}
            onClick={onPause}
          >
            <Pause className="h-5 w-5" />
          </Button>
        ) : status === "paused" || status === "break" ? (
          <Button
            variant="outline"
            size="icon"
            className={`h-12 w-12 rounded-full border-2 border-${buttonColor} text-${buttonColor} hover:bg-${buttonColor}/10 transition-all duration-200 shadow-md`}
            onClick={onResume}
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : null}

        {status !== "idle" && (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 border-destructive text-destructive hover:bg-destructive/10 transition-all duration-200 shadow-md"
            onClick={onStop}
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        )}
      </div>

      {!isBreak && status === "running" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-medium bg-destructive/5 text-destructive hover:bg-destructive/10 mt-2 rounded-full px-4 py-1 transition-all duration-200"
          onClick={onLogDistraction}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Log Distraction
        </Button>
      )}
    </div>
  );
};
