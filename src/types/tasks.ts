export type TaskCategory = 'Consume' | 'Create' | 'Care' | 'Connect';
export type TaskType = 'work' | 'personal';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3 | 4; // P1, P2, P3, P4
  energy_level?: 'high' | 'low';
  is_completed: boolean;
  is_scheduled_today: boolean;
  completion_date?: string;
  due_date?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category?: TaskCategory;
  task_type: TaskType;
}

export const priorityLabels: Record<number, string> = {
  1: 'P1 - Must do today',
  2: 'P2 - Must do this week',
  3: 'P3 - Can do in upcoming weeks',
  4: 'P4 - Backlog, no deadline',
};

export const priorityColors: Record<number, string> = {
  1: 'text-red-500 border-red-500',
  2: 'text-orange-500 border-orange-500',
  3: 'text-yellow-500 border-yellow-500',
  4: 'text-green-500 border-green-500',
};

export const priorityBackgroundColors: Record<number, string> = {
  1: 'bg-red-50/70',
  2: 'bg-orange-50/70',
  3: 'bg-yellow-50/70',
  4: 'bg-green-50/70',
};

export const priorityEmojis: Record<number, string> = {
  1: '🔴',
  2: '🟠',
  3: '🟡',
  4: '🟢',
};

export const energyLevelIcons: Record<string, string> = {
  high: '⚡',
  low: '🔋'
};

export interface XPEvent {
  amount: number;
  reason: string;
  timestamp: Date;
}
