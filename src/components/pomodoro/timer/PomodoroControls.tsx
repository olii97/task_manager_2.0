import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, StopCircle } from "lucide-react";
import { PomodoroStatus } from "@/types/pomodoro";

interface PomodoroControlsProps {
  status: PomodoroStatus;
  isBreak: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const PomodoroControls: React.FC<PomodoroControlsProps> = ({
  status,
  isBreak,
  onPause,
  onResume,
  onStop,
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
    </div>
  );
};
