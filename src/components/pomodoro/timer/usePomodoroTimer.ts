
import { useState, useEffect, useRef } from 'react';
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
  
  // Use refs for values that should not trigger re-renders
  const isTimerRunningRef = useRef(isTimerRunning);
  const statusRef = useRef(state.status);
  const timerSettingsRef = useRef(timerSettings);
  const timeRemainingRef = useRef(state.timeRemaining);
  const isBreakRef = useRef(state.isBreak);
  const intervalRef = useRef<number | null>(null);

  // Update refs when values change
  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning;
    timeRemainingRef.current = state.timeRemaining;
    isBreakRef.current = state.isBreak;
    statusRef.current = state.status;
  }, [isTimerRunning, state.timeRemaining, state.isBreak, state.status]);

  useEffect(() => {
    timerSettingsRef.current = timerSettings;
  }, [timerSettings]);

  // Store original page title
  useEffect(() => {
    if (!originalPageTitle) {
      setOriginalPageTitle(document.title);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.title = originalPageTitle;
    };
  }, [originalPageTitle]);

  // Clean up on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Initialize timer and handle countdown
  useEffect(() => {
    if (isTimerRunning && state.status === 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            // Timer completed
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
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
                timeRemaining: timerSettingsRef.current.workDuration * 60,
                originalDuration: timerSettingsRef.current.workDuration * 60
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
    } else if (intervalRef.current && !isTimerRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerRunning, state.status, completePomodoro]);

  // Update state when selected task changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      currentTask: selectedTask
    }));
  }, [selectedTask]);

  // Update browser tab title with timer
  useEffect(() => {
    if (isTimerRunning && state.status === 'running') {
      const formattedTime = formatTime(state.timeRemaining);
      const sessionType = state.isBreak ? "Break" : "Focus";
      document.title = `${formattedTime} | ${sessionType} - Reflect`;
    } else {
      // Restore original title when timer is not running
      if (originalPageTitle) {
        document.title = originalPageTitle;
      }
    }
  }, [state.timeRemaining, state.isBreak, state.status, isTimerRunning, originalPageTitle]);

  // Update state when settings or selected task changes
  useEffect(() => {
    // Only update if not currently running to avoid interrupting active sessions
    if (state.status !== 'running') {
      setState(prev => ({
        ...prev,
        timeRemaining: timerSettings.workDuration * 60,
        originalDuration: timerSettings.workDuration * 60,
        currentTask: selectedTask
      }));
    }
  }, [timerSettings, selectedTask, state.status]);

  // Update status and sessions count when isTimerRunning changes
  useEffect(() => {
    if (isTimerRunning !== (state.status === 'running')) {
      setState(prev => ({
        ...prev,
        status: isTimerRunning ? 'running' : prev.status === 'running' ? 'paused' : 'idle',
        sessionsCompleted: completedCount
      }));
    } else if (completedCount !== state.sessionsCompleted) {
      setState(prev => ({
        ...prev,
        sessionsCompleted: completedCount
      }));
    }
  }, [isTimerRunning, completedCount, state.status, state.sessionsCompleted]);

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
