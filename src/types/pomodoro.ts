
export interface PomodoroSession {
  id: string;
  user_id: string;
  task_id: string;
  duration_minutes: number;
  start_time: string;
  end_time?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PomodoroDistraction {
  id: string;
  session_id: string;
  description: string;
  created_at: string;
}

export interface PomodoroSettings {
  defaultDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakAfter: number;
}

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed';

export interface PomodoroState {
  status: PomodoroStatus;
  currentTask?: {
    id: string;
    title: string;
  };
  timeRemaining: number;
  originalDuration: number;
  sessionId?: string;
  sessionsCompleted: number;
  distractions: PomodoroDistraction[];
  isBreak: boolean;
  breakDuration: number;
}

export interface DistractionInput {
  description: string;
}
