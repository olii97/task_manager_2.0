import { Project } from "./projects";

export interface Milestone {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  date: string; // Consider using Date type if appropriate
  is_completed: boolean;
  is_main: boolean; // Added to distinguish main vs sub-milestones
  created_at?: string;
  updated_at?: string;
  project?: Project; // Optional relation
}

export type CreateMilestone = Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMilestone = Partial<Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'project_id' | 'user_id'>>; 