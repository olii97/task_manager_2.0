
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
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex gap-2 justify-center">
        {status === "running" ? (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-pomodoro-primary text-pomodoro-primary hover:bg-pomodoro-primary/10"
            onClick={onPause}
          >
            <Pause className="h-5 w-5" />
          </Button>
        ) : status === "paused" || status === "break" ? (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-pomodoro-primary text-pomodoro-primary hover:bg-pomodoro-primary/10"
            onClick={onResume}
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : null}

        {status !== "idle" && (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-destructive text-destructive hover:bg-destructive/10"
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
          className="text-xs text-destructive hover:bg-destructive/5 mt-2"
          onClick={onLogDistraction}
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Log Distraction
        </Button>
      )}
    </div>
  );
};
