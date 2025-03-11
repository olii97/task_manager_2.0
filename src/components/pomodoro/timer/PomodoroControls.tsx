
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, StopCircle, PlusCircle } from "lucide-react";

interface PomodoroControlsProps {
  status: 'idle' | 'running' | 'paused' | 'completed';
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
    <>
      <div className="flex justify-center space-x-3 mb-4">
        {status === 'running' ? (
          <Button 
            onClick={onPause} 
            variant="outline" 
            size="sm"
            className="w-28"
          >
            <Pause className="mr-1 h-4 w-4" /> Pause
          </Button>
        ) : status === 'paused' ? (
          <Button 
            onClick={onResume} 
            variant="outline" 
            size="sm"
            className="w-28"
          >
            <Play className="mr-1 h-4 w-4" /> Resume
          </Button>
        ) : null}
        
        <Button 
          onClick={onStop} 
          variant="ghost" 
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50/20"
        >
          <StopCircle className="mr-1 h-4 w-4" /> Stop
        </Button>
      </div>

      {!isBreak && status !== 'completed' && (
        <Button 
          onClick={onLogDistraction}
          variant="outline" 
          size="sm"
          className="w-full text-xs"
        >
          <PlusCircle className="mr-1 h-3 w-3" /> Log Distraction
        </Button>
      )}
    </>
  );
};
