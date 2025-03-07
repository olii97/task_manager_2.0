import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { PomodoroState, PomodoroStatus, DistractionInput, PomodoroDistraction } from "@/types/pomodoro";
import { useAuth } from "@/components/AuthProvider";
import { startPomodoroSession, completePomodoroSession, addPomodoroDistraction, getPomodoroSessionsCompletedToday } from "@/services/pomodoroService";
import { Task } from "@/types/tasks";

interface PomodoroContextType {
  state: PomodoroState;
  startPomodoro: (task: Task, durationMinutes?: number) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: () => void;
  completePomodoro: () => void;
  addDistraction: (distraction: DistractionInput) => void;
  startBreak: (duration?: number) => void;
  skipBreak: () => void;
  isActive: boolean;
}

const initialState: PomodoroState = {
  status: 'idle',
  timeRemaining: 0,
  originalDuration: 25 * 60, // 25 minutes in seconds
  sessionsCompleted: 0,
  distractions: [],
  isBreak: false,
  breakDuration: 5 * 60, // 5 minutes in seconds
};

type PomodoroAction = 
  | { type: 'START'; payload: { task: Task, durationMinutes?: number, sessionId: string } }
  | { type: 'TICK'; payload: { currentTime: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'COMPLETE' }
  | { type: 'ADD_DISTRACTION'; payload: PomodoroDistraction }
  | { type: 'START_BREAK'; payload: { duration: number } }
  | { type: 'SKIP_BREAK' }
  | { type: 'SET_SESSIONS_COMPLETED'; payload: number };

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const saveTimerState = (state: Partial<PomodoroState>) => {
  try {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving timer state to localStorage:', e);
  }
};

const loadTimerState = (): Partial<PomodoroState> | null => {
  try {
    const saved = localStorage.getItem('pomodoroState');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error loading timer state from localStorage:', e);
    return null;
  }
};

const clearTimerState = () => {
  try {
    localStorage.removeItem('pomodoroState');
  } catch (e) {
    console.error('Error clearing timer state from localStorage:', e);
  }
};

const pomodoroReducer = (state: PomodoroState, action: PomodoroAction): PomodoroState => {
  let newState: PomodoroState;
  
  switch (action.type) {
    case 'START':
      const durationMinutes = action.payload.durationMinutes || 25;
      const durationSeconds = durationMinutes * 60;
      newState = {
        ...state,
        status: 'running',
        currentTask: {
          id: action.payload.task.id,
          title: action.payload.task.title,
          priority: action.payload.task.priority || 4,
          is_completed: action.payload.task.is_completed || false,
          is_scheduled_today: action.payload.task.is_scheduled_today || false,
          created_at: action.payload.task.created_at || new Date().toISOString(),
          updated_at: action.payload.task.updated_at || new Date().toISOString()
        },
        timeRemaining: durationSeconds,
        originalDuration: durationSeconds,
        sessionId: action.payload.sessionId,
        distractions: [],
        isBreak: false,
        startTimestamp: Date.now(),
      };
      saveTimerState(newState);
      return newState;

    case 'TICK':
      if (state.status !== 'running' && state.status !== 'break') {
        return state;
      }
      
      if (state.timeRemaining <= 1) {
        newState = state.isBreak 
          ? { ...state, status: 'idle', timeRemaining: 0 }
          : { ...state, status: 'completed', timeRemaining: 0 };
        clearTimerState();
        return newState;
      }
      
      newState = {
        ...state,
        timeRemaining: state.timeRemaining - 1,
      };
      saveTimerState(newState);
      return newState;

    case 'PAUSE':
      newState = {
        ...state,
        status: 'paused',
        pausedTimestamp: Date.now(),
      };
      saveTimerState(newState);
      return newState;

    case 'RESUME':
      newState = {
        ...state,
        status: 'running',
        startTimestamp: state.startTimestamp ? 
          // Adjust startTimestamp based on pause duration
          state.startTimestamp + (Date.now() - (state.pausedTimestamp || Date.now())) 
          : Date.now(),
        pausedTimestamp: undefined,
      };
      saveTimerState(newState);
      return newState;

    case 'STOP':
      clearTimerState();
      return {
        ...initialState,
        sessionsCompleted: state.sessionsCompleted,
      };

    case 'COMPLETE':
      clearTimerState();
      return {
        ...state,
        status: 'completed',
        sessionsCompleted: state.sessionsCompleted + 1,
      };

    case 'ADD_DISTRACTION':
      newState = {
        ...state,
        distractions: [...state.distractions, action.payload],
      };
      saveTimerState(newState);
      return newState;

    case 'START_BREAK':
      newState = {
        ...state,
        status: 'break',
        isBreak: true,
        timeRemaining: action.payload.duration,
        breakDuration: action.payload.duration,
        startTimestamp: Date.now(),
      };
      saveTimerState(newState);
      return newState;

    case 'SKIP_BREAK':
      clearTimerState();
      return {
        ...initialState,
        sessionsCompleted: state.sessionsCompleted,
      };

    case 'SET_SESSIONS_COMPLETED':
      return {
        ...state,
        sessionsCompleted: action.payload,
      };

    default:
      return state;
  }
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);
  const [isTimerInitialized, setIsTimerInitialized] = useState(false);

  useEffect(() => {
    if (!isTimerInitialized) {
      const savedState = loadTimerState();
      
      if (savedState && savedState.status && 
          (savedState.status === 'running' || savedState.status === 'break' || savedState.status === 'paused')) {
        
        if (savedState.startTimestamp && savedState.status === 'running' || savedState.status === 'break') {
          const elapsedSeconds = Math.floor((Date.now() - savedState.startTimestamp) / 1000);
          const newTimeRemaining = Math.max(0, (savedState.timeRemaining || 0) - elapsedSeconds);
          
          if (newTimeRemaining <= 0) {
            clearTimerState();
          } else {
            dispatch({
              type: 'START',
              payload: {
                task: { 
                  id: savedState.currentTask?.id || 'unknown', 
                  title: savedState.currentTask?.title || 'Unknown Task' 
                },
                sessionId: savedState.sessionId || 'unknown',
              }
            });
            Object.assign(state, {
              ...savedState,
              timeRemaining: newTimeRemaining
            });
          }
        }
      }
      
      setIsTimerInitialized(true);
    }
  }, [isTimerInitialized]);

  useEffect(() => {
    if (userId) {
      getPomodoroSessionsCompletedToday(userId).then(count => {
        dispatch({ type: 'SET_SESSIONS_COMPLETED', payload: count });
      });
    }
  }, [userId]);

  useEffect(() => {
    if ((state.status === 'running' || state.status === 'break') && isTimerInitialized) {
      const intervalId = setInterval(() => {
        dispatch({ type: 'TICK', payload: { currentTime: Date.now() } });
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [state.status, isTimerInitialized]);

  useEffect(() => {
    if (state.status === 'completed' && state.currentTask && state.sessionId) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Error playing sound:', e));
      
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      completePomodoroSession(state.sessionId, state.currentTask.title);
    }
  }, [state.status, state.currentTask, state.sessionId]);

  useEffect(() => {
    const originalTitle = document.title;
    
    if (state.status === 'running' || state.status === 'break') {
      const minutes = Math.floor(state.timeRemaining / 60);
      const seconds = state.timeRemaining % 60;
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (state.isBreak) {
        document.title = `☕ ${timeString} - Break`;
      } else {
        document.title = `⏳ ${timeString} - Focus`;
      }
    } else {
      document.title = originalTitle;
    }
    
    return () => {
      document.title = originalTitle;
    };
  }, [state.timeRemaining, state.status, state.isBreak]);

  const startPomodoro = async (task: Task, durationMinutes?: number) => {
    if (!userId) return;
    
    const session = await startPomodoroSession(
      userId,
      task.id,
      durationMinutes || 25
    );
    
    if (session) {
      dispatch({
        type: 'START',
        payload: { task, durationMinutes, sessionId: session.id },
      });
    }
  };

  const pausePomodoro = () => {
    dispatch({ type: 'PAUSE' });
  };

  const resumePomodoro = () => {
    dispatch({ type: 'RESUME' });
  };

  const stopPomodoro = () => {
    dispatch({ type: 'STOP' });
  };

  const completePomodoro = () => {
    if (state.currentTask && state.sessionId) {
      completePomodoroSession(state.sessionId, state.currentTask.title);
      dispatch({ type: 'COMPLETE' });
    }
  };

  const addDistraction = async (distraction: DistractionInput) => {
    if (!state.sessionId) return;
    
    const newDistraction = await addPomodoroDistraction(
      state.sessionId,
      distraction
    );
    
    if (newDistraction) {
      dispatch({ type: 'ADD_DISTRACTION', payload: newDistraction });
    }
  };

  const startBreak = (duration?: number) => {
    const breakDuration = duration || 5 * 60; // Default 5 minutes in seconds
    dispatch({ type: 'START_BREAK', payload: { duration: breakDuration } });
  };

  const skipBreak = () => {
    dispatch({ type: 'SKIP_BREAK' });
  };

  const value = {
    state,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    completePomodoro,
    addDistraction,
    startBreak,
    skipBreak,
    isActive: state.status !== 'idle',
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
