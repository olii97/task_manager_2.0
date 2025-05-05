import { useState, useEffect, useRef, useCallback } from 'react';
import { usePomodoro } from '../PomodoroProvider';
import { PomodoroState, PomodoroStatus, PomodoroDistraction } from '@/types/pomodoro';
import { logPomodoroDistraction } from '@/services/pomodoroService';
import { updateTask } from '@/services/tasks';

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
  const animationStartedRef = useRef(false);

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
            setShowConfetti(true);
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
            completePomodoro();
            animationStartedRef.current = false;
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
      } else {
        animationStartedRef.current = false;
      }
    };
    
    rafIdRef.current = requestAnimationFrame(timerLoop);
  }, [completePomodoro, setIsTimerRunning, onComplete]);

  // Initialize timer and handle countdown
  useEffect(() => {
    console.log(`[usePomodoroTimer] useEffect triggered. isTimerRunning: ${isTimerRunning}, state.status: ${state.status}`);
    if (isTimerRunning && state.status === 'running') {
      console.log('[usePomodoroTimer] Timer condition met, starting animation.');
      // Set or update the start timestamp when the timer starts running
      if (!state.startTimestamp) {
        setState(prev => ({
          ...prev,
          startTimestamp: Date.now(),
          lastTickTime: Date.now()
        }));
      }
      
      // Only start animation if it's not already running
      if (!animationStartedRef.current) {
        startTimerAnimation();
        animationStartedRef.current = true;
      }
    } else if (rafIdRef.current && !isTimerRunning) {
      console.log('[usePomodoroTimer] Timer condition NOT met or timer stopped, cancelling animation frame.');
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      animationStartedRef.current = false;
      
      // Store the pause timestamp
      if (state.status === 'paused') {
        setState(prev => ({
          ...prev,
          pausedTimestamp: Date.now()
        }));
      }
    }
    
    console.log('[usePomodoroTimer] useEffect finished.');
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        animationStartedRef.current = false;
      }
    };
  }, [isTimerRunning, state.status, state.startTimestamp]);

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
    console.log(`[usePomodoroTimer] Status effect: isTimerRunning=${isTimerRunning}, status=${state.status}`);
    if (isTimerRunning !== (state.status === 'running')) {
      console.log(`[usePomodoroTimer] Updating status: ${isTimerRunning ? 'running' : state.status === 'running' ? 'paused' : 'idle'}`);
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
    animationStartedRef.current = false;
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
    animationStartedRef.current = false;
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

  const completeCurrentTask = useCallback(async () => {
    if (!state.currentTask) return;

    await updateTask(state.currentTask.id, {
      is_completed: true,
      completion_date: new Date().toISOString()
    });

    // Add a ticker message for the completed task
    if (window.addTickerMessage) {
      window.addTickerMessage(`TASK COMPLETED: ${state.currentTask.title}`);
    }

    setState(prev => ({
      ...prev,
      currentTask: undefined
    }));
  }, [state.currentTask]);

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
    setTimerToFiveSeconds,
    completeCurrentTask,
    handleLogDistraction: logDistraction
  };
};
