import { useState, useEffect, useRef, useCallback } from 'react';
import { usePomodoro } from '../PomodoroProvider';
import { PomodoroState, PomodoroStatus, PomodoroDistraction } from '@/types/pomodoro';
import { logPomodoroDistraction } from '@/services/pomodoroService';

interface UsePomodoroTimerProps {
  onComplete?: () => void;
}

export const usePomodoroTimer = ({ onComplete }: UsePomodoroTimerProps = {}) => {
  const {
    timerSettings,
    selectedTask,
    isTimerRunning,
    completedCount,
    completePomodoro,
    setIsTimerRunning,
    currentSession,
    setCurrentSession,
    currentSessionId,
    logDistraction,
    setDistractions
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
      const now = Date.now();
      const elapsed = now - lastTickTime;
      
      if (elapsed >= 1000) {
        const newState = { ...stateRef.current };
        const decrementAmount = Math.floor(elapsed / 1000);
        
        if (newState.timeRemaining <= decrementAmount) {
          newState.timeRemaining = 0;
          
          if (!newState.isBreak) {
            // Work timer completed
            newState.status = 'completed';
            setState(newState);
            completePomodoro();
            if (onComplete) {
              onComplete();
            }
          } else {
            // Break timer completed - prepare for next work session
            newState.isBreak = false;
            newState.status = 'running';
            newState.timeRemaining = timerSettingsRef.current.workDuration * 60;
            newState.originalDuration = timerSettingsRef.current.workDuration * 60;
            newState.startTimestamp = Date.now();
            setState(newState);
            // Keep the timer running for the next session
            lastTickTime = now;
            rafIdRef.current = requestAnimationFrame(timerLoop);
          }
          return;
        } else {
          newState.timeRemaining -= decrementAmount;
          lastTickTime = now - (elapsed % 1000);
          setState(newState);
        }
      }
      
      if (isRunningRef.current && stateRef.current.status === 'running') {
        rafIdRef.current = requestAnimationFrame(timerLoop);
      }
    };
    
    rafIdRef.current = requestAnimationFrame(timerLoop);
  }, [completePomodoro, setIsTimerRunning, onComplete]);

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

  const handleAddDistraction = useCallback(() => {
    setShowDistractionDialog(true);
  }, []);

  const handleCancelDistraction = useCallback(() => {
    setShowDistractionDialog(false);
  }, []);

  const startBreak = () => {
    setState(prev => ({
      ...prev,
      isBreak: true,
      timeRemaining: timerSettings.breakDuration * 60,
      originalDuration: timerSettings.breakDuration * 60,
      status: 'running',
      startTimestamp: Date.now(),
      pausedTimestamp: undefined
    }));
    setIsTimerRunning(true);
    setShowCompletionDialog(false);
  };

  const skipBreak = () => {
    setState(prev => ({
      ...prev,
      isBreak: false,
      timeRemaining: timerSettings.workDuration * 60,
      originalDuration: timerSettings.workDuration * 60,
      status: 'running',
      startTimestamp: Date.now(),
      pausedTimestamp: undefined
    }));
    setIsTimerRunning(true);
    setShowCompletionDialog(false);
  };

  const handleStartBreak = () => {
    startBreak();
    setShowCompletionDialog(false);
  };

  const handleSkipBreak = () => {
    skipBreak();
  };

  const setTimerToFiveSeconds = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: 5,
      originalDuration: prev.originalDuration
    }));
  }, []);

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
    handleCancelDistraction,
    isTimerRunning,
    setTimerToFiveSeconds
  };
};
