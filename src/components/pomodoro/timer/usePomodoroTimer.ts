import { useState, useEffect, useRef, useCallback } from 'react';
import { usePomodoro } from '../PomodoroProvider';
import { PomodoroState, PomodoroStatus } from '@/types/pomodoro';

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
    distractions: [],
    breakDuration: timerSettings.breakDuration,
  });

  const [originalPageTitle, setOriginalPageTitle] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDistractionDialog, setShowDistractionDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  // Use refs for values that should not trigger re-renders
  const stateRef = useRef(state);
  const timerSettingsRef = useRef(timerSettings);
  const rafIdRef = useRef<number | null>(null);
  const isRunningRef = useRef(isTimerRunning);

  // Update refs when values change
  useEffect(() => {
    stateRef.current = state;
    isRunningRef.current = isTimerRunning;
  }, [state, isTimerRunning]);

  useEffect(() => {
    timerSettingsRef.current = timerSettings;
  }, [timerSettings]);

  // Store original page title
  useEffect(() => {
    if (!originalPageTitle) {
      setOriginalPageTitle(document.title);
    }
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      document.title = originalPageTitle;
    };
  }, [originalPageTitle]);

  // Clean up on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  // More accurate timer using requestAnimationFrame instead of setInterval
  const startTimerAnimation = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    let lastTickTime = Date.now();
    
    const timerLoop = () => {
      // Calculate elapsed time since last tick
      const now = Date.now();
      const elapsed = now - lastTickTime;
      
      // Only update if more than 1000ms have passed
      if (elapsed >= 1000) {
        const newState = { ...stateRef.current };
        
        // Number of seconds to decrement (handles case where browser throttles in background)
        const decrementAmount = Math.floor(elapsed / 1000);
        
        if (newState.timeRemaining <= decrementAmount) {
          // Timer completed
          newState.timeRemaining = 0;
          
          if (!newState.isBreak) {
            // Work timer completed
            newState.status = 'completed';
            setState(newState);
            completePomodoro();
          } else {
            // Break timer completed
            newState.isBreak = false;
            newState.status = 'idle' as PomodoroStatus;
            newState.timeRemaining = timerSettingsRef.current.workDuration * 60;
            newState.originalDuration = timerSettingsRef.current.workDuration * 60;
            setState(newState);
            setIsTimerRunning(false);
          }
          return;
        } else {
          // Decrement timer by calculated amount
          newState.timeRemaining -= decrementAmount;
          lastTickTime = now - (elapsed % 1000); // Keep remainder for accurate timing
          setState(newState);
        }
      }
      
      // Continue the loop only if timer is still running
      if (isRunningRef.current && stateRef.current.status === 'running') {
        rafIdRef.current = requestAnimationFrame(timerLoop);
      }
    };
    
    rafIdRef.current = requestAnimationFrame(timerLoop);
  }, [completePomodoro, setIsTimerRunning]);

  // Initialize timer and handle countdown
  useEffect(() => {
    if (isTimerRunning && state.status === 'running') {
      // Set or update the start timestamp when the timer starts running
      if (!state.startTimestamp) {
        setState(prev => ({
          ...prev,
          startTimestamp: Date.now(),
          lastTickTime: Date.now()
        }));
      }
      
      startTimerAnimation();
    } else if (rafIdRef.current && !isTimerRunning) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      
      // Store the pause timestamp
      if (state.status === 'paused') {
        setState(prev => ({
          ...prev,
          pausedTimestamp: Date.now()
        }));
      }
    }
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isTimerRunning, state.status, state.startTimestamp, startTimerAnimation]);

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
      status: 'paused',
      pausedTimestamp: Date.now()
    }));
  };

  const resumePomodoro = () => {
    setIsTimerRunning(true);
    setState(prev => ({
      ...prev,
      status: 'running',
      pausedTimestamp: undefined
    }));
  };

  const stopPomodoro = () => {
    setIsTimerRunning(false);
    setState(prev => ({
      ...prev,
      status: 'idle',
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      startTimestamp: undefined,
      pausedTimestamp: undefined
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
      status: 'running' as PomodoroStatus,
      startTimestamp: Date.now(),
      pausedTimestamp: undefined
    }));
    setIsTimerRunning(true);
  };

  const skipBreak = () => {
    setState(prev => ({
      ...prev,
      isBreak: false,
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      status: 'idle',
      startTimestamp: undefined,
      pausedTimestamp: undefined
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
