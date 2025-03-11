
import React, { useState, useEffect } from "react";
import { usePomodoro } from "./PomodoroProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Play, 
  Pause, 
  StopCircle, 
  XCircle, 
  CheckCircle, 
  Coffee, 
  PlusCircle, 
  Timer 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";

// Define the state type to match what we reference in the component
interface PomodoroState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  timeRemaining: number;
  originalDuration: number;
  isBreak: boolean;
  sessionsCompleted: number;
  currentTask?: {
    id: string;
    title: string;
  };
}

export const PomodoroTimer: React.FC = () => {
  const {
    timerSettings,
    selectedTask,
    isTimerRunning,
    currentSession,
    completedCount,
    completePomodoro,
    setIsTimerRunning,
    autoCompleteTask,
    setAutoCompleteTask
  } = usePomodoro();

  // Mock state for compatibility
  const [mockState, setMockState] = useState<PomodoroState>({
    status: 'idle',
    timeRemaining: timerSettings.workDuration * 60,
    originalDuration: timerSettings.workDuration * 60,
    isBreak: false,
    sessionsCompleted: completedCount,
    currentTask: selectedTask,
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [showDistractionDialog, setShowDistractionDialog] = useState(false);
  const [distractionText, setDistractionText] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [originalPageTitle, setOriginalPageTitle] = useState("");

  // Initialize timer
  useEffect(() => {
    // Store the original page title on mount
    setOriginalPageTitle(document.title);
    
    // Set up the countdown timer
    let interval: number | null = null;
    
    if (isTimerRunning && mockState.status === 'running') {
      interval = window.setInterval(() => {
        setMockState(prev => {
          if (prev.timeRemaining <= 1) {
            // Timer completed
            clearInterval(interval!);
            
            // Mark as completed if it was a work session
            if (!prev.isBreak) {
              completePomodoro();
              return {
                ...prev,
                status: 'completed',
                timeRemaining: 0
              };
            } else {
              // Break completed
              return {
                ...prev,
                status: 'idle',
                isBreak: false,
                timeRemaining: timerSettings.workDuration * 60,
                originalDuration: timerSettings.workDuration * 60
              };
            }
          } else {
            // Continue countdown
            return {
              ...prev,
              timeRemaining: prev.timeRemaining - 1
            };
          }
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      // Restore original title on unmount
      document.title = originalPageTitle;
    };
  }, [isTimerRunning, mockState.status, completePomodoro, timerSettings.workDuration]);

  // Update browser tab title with timer
  useEffect(() => {
    if (isTimerRunning && mockState.status === 'running') {
      const formattedTime = formatTime(mockState.timeRemaining);
      const sessionType = mockState.isBreak ? "Break" : "Focus";
      document.title = `${formattedTime} | ${sessionType} - Reflect`;
    } else {
      // Restore original title when timer is not running
      document.title = originalPageTitle;
    }
    
    return () => {
      document.title = originalPageTitle;
    };
  }, [mockState.timeRemaining, mockState.isBreak, mockState.status, isTimerRunning, originalPageTitle]);

  // Update mock state when timer settings change
  useEffect(() => {
    setMockState(prev => ({
      ...prev,
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      currentTask: selectedTask
    }));
  }, [timerSettings, selectedTask]);

  // Update status based on isTimerRunning
  useEffect(() => {
    setMockState(prev => ({
      ...prev,
      status: isTimerRunning ? 'running' : 'idle',
      sessionsCompleted: completedCount
    }));
  }, [isTimerRunning, completedCount]);

  // Mock functions for compatibility
  const pausePomodoro = () => {
    setIsTimerRunning(false);
    setMockState(prev => ({
      ...prev,
      status: 'paused'
    }));
  };

  const resumePomodoro = () => {
    setIsTimerRunning(true);
    setMockState(prev => ({
      ...prev,
      status: 'running'
    }));
  };

  const stopPomodoro = () => {
    setIsTimerRunning(false);
    setMockState(prev => ({
      ...prev,
      status: 'idle',
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60
    }));
  };

  const addDistraction = (distraction: { description: string }) => {
    console.log('Distraction logged:', distraction.description);
    // In a real implementation, this would save the distraction to the database
  };

  const startBreak = () => {
    setMockState(prev => ({
      ...prev,
      isBreak: true,
      timeRemaining: timerSettings.breakDuration * 60,
      originalDuration: timerSettings.breakDuration * 60,
      status: 'running'
    }));
    setIsTimerRunning(true);
  };

  const skipBreak = () => {
    setMockState(prev => ({
      ...prev,
      isBreak: false,
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      status: 'idle'
    }));
    setIsTimerRunning(false);
    setShowCompletionDialog(false);
  };

  // This replaces state in the component
  const state = mockState;

  useEffect(() => {
    // Show completion dialog when pomodoro is completed
    if (state.status === 'completed') {
      setShowConfetti(true);
      setShowCompletionDialog(true);
      
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddDistraction = () => {
    if (distractionText.trim() === "") return;
    
    addDistraction({ description: distractionText });
    setDistractionText("");
    setShowDistractionDialog(false);
    
    // Auto resume after logging distraction
    if (state.status === 'paused') {
      resumePomodoro();
    }
  };

  const handleStartBreak = () => {
    startBreak();
    setShowCompletionDialog(false);
  };

  const handleSkipBreak = () => {
    skipBreak();
    setShowCompletionDialog(false);
  };

  const calculateProgress = (): number => {
    if (state.originalDuration === 0) return 0;
    return (state.timeRemaining / state.originalDuration) * 100;
  };

  // Don't render if not active
  if (!isTimerRunning && state.status === 'idle') {
    return null;
  }

  return (
    <>
      <ConfettiEffect isActive={showConfetti} />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <Card className="w-80 md:w-96 bg-black/80 border-pomodoro-primary/20 shadow-xl backdrop-blur-lg pointer-events-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-pomodoro-primary flex items-center">
                  <Timer className="mr-1 h-4 w-4" />
                  {state.isBreak ? "Break Time" : "Focus Mode"}
                </h3>
                <div className="text-xs bg-pomodoro-primary/20 text-pomodoro-primary px-2 py-1 rounded-full">
                  🔥 {state.sessionsCompleted} Today
                </div>
              </div>
              
              {state.currentTask && !state.isBreak && (
                <div className="text-sm font-medium mb-4 bg-background/80 p-2 rounded border border-border">
                  {state.currentTask.title}
                </div>
              )}
              
              <div className="w-48 h-48 mx-auto mb-4">
                <CircularProgressbar
                  value={calculateProgress()}
                  text={formatTime(state.timeRemaining)}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: state.isBreak ? '#B5A7F2' : '#E63946',
                    textColor: state.isBreak ? '#B5A7F2' : '#E63946',
                    trailColor: 'rgba(255, 255, 255, 0.2)',
                    pathTransition: 'stroke-dashoffset 0.5s ease 0s',
                  })}
                />
              </div>
              
              <div className="flex justify-center space-x-3 mb-4">
                {state.status === 'running' ? (
                  <Button 
                    onClick={pausePomodoro} 
                    variant="outline" 
                    size="sm"
                    className="w-28"
                  >
                    <Pause className="mr-1 h-4 w-4" /> Pause
                  </Button>
                ) : state.status === 'paused' ? (
                  <Button 
                    onClick={resumePomodoro} 
                    variant="outline" 
                    size="sm"
                    className="w-28"
                  >
                    <Play className="mr-1 h-4 w-4" /> Resume
                  </Button>
                ) : null}
                
                <Button 
                  onClick={stopPomodoro} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50/20"
                >
                  <StopCircle className="mr-1 h-4 w-4" /> Stop
                </Button>
              </div>

              {!state.isBreak && state.status !== 'completed' && (
                <Button 
                  onClick={() => {
                    pausePomodoro();
                    setShowDistractionDialog(true);
                  }}
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs"
                >
                  <PlusCircle className="mr-1 h-3 w-3" /> Log Distraction
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Distraction Dialog */}
      <Dialog open={showDistractionDialog} onOpenChange={setShowDistractionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log a Distraction</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              What distracted you? We'll add this to your task backlog.
            </p>
            <Input
              value={distractionText}
              onChange={(e) => setDistractionText(e.target.value)}
              placeholder="What was the distraction?"
              className="mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddDistraction();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDistractionDialog(false);
                resumePomodoro();
              }}
            >
              <XCircle className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleAddDistraction}>
              <CheckCircle className="mr-1 h-4 w-4" /> Add & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-pomodoro-primary">
              🎉 Pomodoro Completed!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <h3 className="text-xl font-bold mb-2">+20 XP Earned!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Great work! Take a break before your next focus session.
            </p>
            <div className="bg-pomodoro-primary/10 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium">
                🔥 {state.sessionsCompleted} Focus Sessions Completed Today
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleSkipBreak}
              className="sm:flex-1"
            >
              <XCircle className="mr-1 h-4 w-4" /> Skip Break
            </Button>
            <Button 
              onClick={handleStartBreak}
              variant="outline"
              className="sm:flex-1"
            >
              <Coffee className="mr-1 h-4 w-4" /> Take a 5 Min Break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
