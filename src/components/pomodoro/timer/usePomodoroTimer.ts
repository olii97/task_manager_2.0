
import { useState, useEffect } from 'react';
import { usePomodoro } from '../PomodoroProvider';

export interface PomodoroState {
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

export const usePomodoroTimer = () => {
  const {
    timerSettings,
    selectedTask,
    isTimerRunning,
    completedCount,
    completePomodoro,
    setIsTimerRunning,
  } = usePomodoro();

  const [state, setState] = useState<PomodoroState>({
    status: 'idle',
    timeRemaining: timerSettings.workDuration * 60,
    originalDuration: timerSettings.workDuration * 60,
    isBreak: false,
    sessionsCompleted: completedCount,
    currentTask: selectedTask,
  });

  const [originalPageTitle, setOriginalPageTitle] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDistractionDialog, setShowDistractionDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Initialize timer and handle page title
  useEffect(() => {
    // Store the original page title on mount
    setOriginalPageTitle(document.title);
    
    // Set up the countdown timer
    let interval: number | null = null;
    
    if (isTimerRunning && state.status === 'running') {
      interval = window.setInterval(() => {
        setState(prev => {
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
  }, [isTimerRunning, state.status, completePomodoro, timerSettings.workDuration, originalPageTitle]);

  // Update browser tab title with timer
  useEffect(() => {
    if (isTimerRunning && state.status === 'running') {
      const formattedTime = formatTime(state.timeRemaining);
      const sessionType = state.isBreak ? "Break" : "Focus";
      document.title = `${formattedTime} | ${sessionType} - Reflect`;
    } else {
      // Restore original title when timer is not running
      document.title = originalPageTitle;
    }
    
    return () => {
      document.title = originalPageTitle;
    };
  }, [state.timeRemaining, state.isBreak, state.status, isTimerRunning, originalPageTitle]);

  // Update state when timer settings change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      currentTask: selectedTask
    }));
  }, [timerSettings, selectedTask]);

  // Update status based on isTimerRunning
  useEffect(() => {
    setState(prev => ({
      ...prev,
      status: isTimerRunning ? 'running' : 'idle',
      sessionsCompleted: completedCount
    }));
  }, [isTimerRunning, completedCount]);

  // Show completion dialog when pomodoro is completed
  useEffect(() => {
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

  const pausePomodoro = () => {
    setIsTimerRunning(false);
    setState(prev => ({
      ...prev,
      status: 'paused'
    }));
  };

  const resumePomodoro = () => {
    setIsTimerRunning(true);
    setState(prev => ({
      ...prev,
      status: 'running'
    }));
  };

  const stopPomodoro = () => {
    setIsTimerRunning(false);
    setState(prev => ({
      ...prev,
      status: 'idle',
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60
    }));
  };

  const addDistraction = (description: string) => {
    console.log('Distraction logged:', description);
    // In a real implementation, this would save the distraction to the database
  };

  const startBreak = () => {
    setState(prev => ({
      ...prev,
      isBreak: true,
      timeRemaining: timerSettings.breakDuration * 60,
      originalDuration: timerSettings.breakDuration * 60,
      status: 'running'
    }));
    setIsTimerRunning(true);
  };

  const skipBreak = () => {
    setState(prev => ({
      ...prev,
      isBreak: false,
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      status: 'idle'
    }));
    setIsTimerRunning(false);
    setShowCompletionDialog(false);
  };

  const handleAddDistraction = (description: string) => {
    addDistraction(description);
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
  };

  const handleLogDistraction = () => {
    pausePomodoro();
    setShowDistractionDialog(true);
  };

  const cancelDistraction = () => {
    setShowDistractionDialog(false);
    resumePomodoro();
  };

  return {
    state,
    showConfetti,
    showDistractionDialog,
    setShowDistractionDialog,
    showCompletionDialog,
    setShowCompletionDialog,
    formatTime,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    handleAddDistraction,
    handleStartBreak,
    handleSkipBreak,
    handleLogDistraction,
    cancelDistraction,
    isTimerRunning
  };
};
