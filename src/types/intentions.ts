
export interface WeeklyIntention {
  id: string;
  user_id: string;
  week_start: string;
  intention_1: string | null;
  intention_2: string | null;
  intention_3: string | null;
  reflection_1: string | null;
  reflection_2: string | null;
  reflection_3: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const mapDatabaseToWeeklyIntention = (data: any): WeeklyIntention => {
  return {
    ...data,
  };
};

export const getCurrentWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};
