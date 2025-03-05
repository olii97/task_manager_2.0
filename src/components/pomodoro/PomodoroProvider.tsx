
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
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'COMPLETE' }
  | { type: 'ADD_DISTRACTION'; payload: PomodoroDistraction }
  | { type: 'START_BREAK'; payload: { duration: number } }
  | { type: 'SKIP_BREAK' }
  | { type: 'SET_SESSIONS_COMPLETED'; payload: number };

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const pomodoroReducer = (state: PomodoroState, action: PomodoroAction): PomodoroState => {
  switch (action.type) {
    case 'START':
      const durationMinutes = action.payload.durationMinutes || 25;
      const durationSeconds = durationMinutes * 60;
      return {
        ...state,
        status: 'running',
        currentTask: {
          id: action.payload.task.id,
          title: action.payload.task.title,
        },
        timeRemaining: durationSeconds,
        originalDuration: durationSeconds,
        sessionId: action.payload.sessionId,
        distractions: [],
        isBreak: false,
      };
    case 'TICK':
      if (state.timeRemaining <= 1) {
        return state.isBreak 
          ? { ...state, status: 'idle', timeRemaining: 0 }
          : { ...state, status: 'completed', timeRemaining: 0 };
      }
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
      };
    case 'PAUSE':
      return {
        ...state,
        status: 'paused',
      };
    case 'RESUME':
      return {
        ...state,
        status: 'running',
      };
    case 'STOP':
      return {
        ...initialState,
        sessionsCompleted: state.sessionsCompleted,
      };
    case 'COMPLETE':
      return {
        ...state,
        status: 'completed',
        sessionsCompleted: state.sessionsCompleted + 1,
      };
    case 'ADD_DISTRACTION':
      return {
        ...state,
        distractions: [...state.distractions, action.payload],
      };
    case 'START_BREAK':
      return {
        ...state,
        status: 'break',
        isBreak: true,
        timeRemaining: action.payload.duration,
        breakDuration: action.payload.duration,
      };
    case 'SKIP_BREAK':
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
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Load sessions completed today on mount
  useEffect(() => {
    if (userId) {
      getPomodoroSessionsCompletedToday(userId).then(count => {
        dispatch({ type: 'SET_SESSIONS_COMPLETED', payload: count });
      });
    }
  }, [userId]);

  // Handle timer ticks
  useEffect(() => {
    if (state.status === 'running' || state.status === 'break') {
      const id = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [state.status]);

  // Handle automatic completion and notifications
  useEffect(() => {
    if (state.status === 'completed' && state.currentTask && state.sessionId) {
      // Play a sound to notify the user
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Error playing sound:', e));
      
      // Vibrate if the device supports it
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // Mark the session as completed in the database
      completePomodoroSession(state.sessionId, state.currentTask.title);
    }
  }, [state.status, state.currentTask, state.sessionId]);

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
