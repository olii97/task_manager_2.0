export interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateMilestone {
  title: string;
  description?: string;
  date: string;
  user_id: string;
}

export type UpdateMilestone = Partial<Omit<Milestone, 'id' | 'user_id'>>; 