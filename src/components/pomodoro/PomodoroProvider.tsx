import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  createPomodoroSession, 
  getPomodoroStats,
  completePomodoroSession,
  logPomodoroDistraction
} from "@/services/pomodoroService";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_WORK_DURATION, DEFAULT_BREAK_DURATION, DEFAULT_LONG_BREAK_DURATION, DEFAULT_SESSIONS_BEFORE_LONG_BREAK } from "@/constants";
import { useSettings } from "@/hooks/useSettings";
import { markTaskComplete } from "@/services/taskService";
import { addUserXP } from "@/services/userService";
import { trackPomodoroEvent } from "@/services/analyticsService";

// Define the types for the context
export interface Task {
  id: string;
  title: string;
}

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface PomodoroDistraction {
  id: string;
  description: string;
  timestamp: string;
}

interface PomodoroContextProps {
  timerSettings: TimerSettings;
  setTimerSettings: (settings: TimerSettings) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (isRunning: boolean) => void;
  currentSession: number;
  setCurrentSession: (session: number) => void;
  completedCount: number;
  setCompletedCount: (count: number) => void;
  isLoading: boolean;
  handleTaskSelected: (task: Task) => void;
  completePomodoro: () => Promise<any>;
  autoCompleteTask: boolean;
  setAutoCompleteTask: (autoComplete: boolean) => void;
  startPomodoro: (task: Task) => void;
  currentSessionId: string | null;
  logDistraction: (params: { session_id: string; description: string; timestamp: string }) => Promise<void>;
  distractions: PomodoroDistraction[];
  setDistractions: React.Dispatch<React.SetStateAction<PomodoroDistraction[]>>;
}

// Create the context with a default value
const PomodoroContext = createContext<PomodoroContextProps>({
  timerSettings: {
    workDuration: DEFAULT_WORK_DURATION,
    breakDuration: DEFAULT_BREAK_DURATION,
    longBreakDuration: DEFAULT_LONG_BREAK_DURATION,
    sessionsBeforeLongBreak: DEFAULT_SESSIONS_BEFORE_LONG_BREAK,
  },
  setTimerSettings: () => {},
  selectedTask: null,
  setSelectedTask: () => {},
  isTimerRunning: false,
  setIsTimerRunning: () => {},
  currentSession: 1,
  setCurrentSession: () => {},
  completedCount: 0,
  setCompletedCount: () => {},
  isLoading: false,
  handleTaskSelected: () => {},
  completePomodoro: () => Promise.resolve(),
  autoCompleteTask: false,
  setAutoCompleteTask: () => {},
  startPomodoro: () => {},
  currentSessionId: null,
  logDistraction: () => Promise.resolve(),
  distractions: [],
  setDistractions: () => {},
});

interface PomodoroProviderProps {
  children: React.ReactNode;
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [autoCompleteTask, setAutoCompleteTask] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { settings, userUpdateSettings } = useSettings();

  const [timerSettings, setTimerSettings] = useState({
    workDuration: settings?.work_duration || DEFAULT_WORK_DURATION,
    breakDuration: settings?.break_duration || DEFAULT_BREAK_DURATION,
    longBreakDuration: settings?.long_break_duration || DEFAULT_LONG_BREAK_DURATION,
    sessionsBeforeLongBreak: settings?.sessions_before_long_break || DEFAULT_SESSIONS_BEFORE_LONG_BREAK,
  });

  useEffect(() => {
    if (settings) {
      setTimerSettings({
        workDuration: settings.work_duration,
        breakDuration: settings.break_duration,
        longBreakDuration: settings.long_break_duration,
        sessionsBeforeLongBreak: settings.sessions_before_long_break,
      });
    }
  }, [settings]);

  useEffect(() => {
    const loadStats = async () => {
      if (session?.user) {
        const stats = await getPomodoroStats(session.user.id);
        if (stats) {
          setCompletedCount(stats.completed_count);
        }
      }
    };

    loadStats();
  }, [session]);

  // Use a separate effect for updating settings to avoid unnecessary triggers
  const userSettingsRef = useRef(false);
  const timerSettingsRef = useRef(timerSettings);
  useEffect(() => {
    // Skip first render
    if (!userSettingsRef.current && settings) {
      userSettingsRef.current = true;
      timerSettingsRef.current = timerSettings;
      return;
    }

    // Only update if there was an actual change to the timer settings
    // and if it was initiated by a user action rather than scrolling/rerendering
    if (session?.user && userSettingsRef.current &&
        (timerSettingsRef.current.workDuration !== timerSettings.workDuration ||
         timerSettingsRef.current.breakDuration !== timerSettings.breakDuration ||
         timerSettingsRef.current.longBreakDuration !== timerSettings.longBreakDuration ||
         timerSettingsRef.current.sessionsBeforeLongBreak !== timerSettings.sessionsBeforeLongBreak)) {
      
      // Store the current settings to compare with later
      timerSettingsRef.current = timerSettings;
      
      // Use userUpdateSettings only when a user explicitly changes settings
      // This avoids showing toasts during initial load or auto-updates
      userUpdateSettings({
        work_duration: timerSettings.workDuration,
        break_duration: timerSettings.breakDuration,
        long_break_duration: timerSettings.longBreakDuration,
        sessions_before_long_break: timerSettings.sessionsBeforeLongBreak,
      });
    }
  }, [timerSettings, session, userUpdateSettings]);

  // Modified function to fix the Task type issue
  const handleTaskSelected = useCallback((task: Task) => {
    setSelectedTask({
      id: task.id,
      title: task.title
    });
    
    // Track the task selection event
    if (session?.user) {
      trackPomodoroEvent({
        user_id: session.user.id,
        event_type: 'task_selected',
        task_id: task.id
      });
    }
  }, [session]);

  const startPomodoro = useCallback(async (task: Task) => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      // Create a new pomodoro session
      const { session: newSession, error } = await createPomodoroSession({
        user_id: session.user.id,
        duration_minutes: timerSettings.workDuration,
        task_id: task.id,
        completed: false
      });

      if (error) throw error;
      if (!newSession) throw new Error('Failed to create session');

      setCurrentSessionId(newSession.id);
      setSelectedTask({
        id: task.id,
        title: task.title
      });
      setIsTimerRunning(true);
      
      // Track the event
      trackPomodoroEvent({
        user_id: session.user.id,
        event_type: 'pomodoro_started',
        task_id: task.id
      });
    } catch (error) {
      console.error('Error starting pomodoro:', error);
      toast({
        title: "Error",
        description: "Could not start the pomodoro session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, timerSettings.workDuration, toast]);

  const logDistraction = useCallback(async (params: { session_id: string; description: string; timestamp: string }) => {
    if (!currentSessionId) return;

    try {
      await logPomodoroDistraction({
        session_id: params.session_id,
        description: params.description
      });
    } catch (error) {
      console.error('Error logging distraction:', error);
      toast({
        title: "Error",
        description: "Could not log the distraction.",
        variant: "destructive"
      });
    }
  }, [currentSessionId, toast]);

  const completePomodoro = useCallback(async () => {
    if (!session?.user || !currentSessionId) return;
    
    try {
      setIsLoading(true);
      
      // Complete the pomodoro session
      await completePomodoroSession(currentSessionId);
      
      toast({
        title: "Pomodoro completed!",
        description: `You completed a ${timerSettings.workDuration} minute pomodoro session.`,
      });
      
      // Update stats
      setCompletedCount(prev => prev + 1);
      
      // Add XP for completing a pomodoro
      addUserXP(session.user.id, 5, 'Completed a pomodoro session');
      
      // Optionally mark task as completed
      if (autoCompleteTask && selectedTask) {
        await markTaskComplete(selectedTask.id);
        toast({
          title: "Task marked as complete",
          description: `"${selectedTask.title}" has been marked as complete.`,
        });
      }
      
      // Reset for next session
      setSelectedTask(null);
      setCurrentSessionId(null);
      
    } catch (error) {
      console.error('Error completing pomodoro:', error);
      toast({
        title: "Error",
        description: "Could not save your pomodoro session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, currentSessionId, timerSettings.workDuration, autoCompleteTask, selectedTask, toast]);

  return (
    <PomodoroContext.Provider
      value={{
        timerSettings,
        setTimerSettings,
        selectedTask,
        setSelectedTask,
        isTimerRunning,
        setIsTimerRunning,
        currentSession,
        setCurrentSession,
        completedCount,
        setCompletedCount,
        isLoading,
        handleTaskSelected,
        completePomodoro,
        autoCompleteTask,
        setAutoCompleteTask,
        startPomodoro,
        currentSessionId,
        logDistraction,
        distractions: [],
        setDistractions: () => {},
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => useContext(PomodoroContext);
