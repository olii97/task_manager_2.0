import { Task } from './tasks';

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  color?: string;
  tasks?: Task[];
  milestones?: {
    id: string;
    title: string;
    date: string;
    description?: string;
    is_completed: boolean;
  }[];
} 