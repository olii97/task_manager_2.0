
import { supabase } from '@/integrations/supabase/client';
import { PomodoroSession, PomodoroStats } from '@/types/pomodoro';
import { PomodoroStatus } from '@/types/pomodoro';

export interface CreatePomodoroSessionParams {
  user_id: string;
  duration_minutes: number;
  task_id?: string;
  completed: boolean;
}

export const createPomodoroSession = async (params: CreatePomodoroSessionParams): Promise<{ session: PomodoroSession | null, error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert([{
        user_id: params.user_id,
        duration_minutes: params.duration_minutes,
        task_id: params.task_id,
        completed: params.completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating pomodoro session:', error);
      return { session: null, error: error.message };
    }

    return { session: data, error: null };
  } catch (error) {
    console.error('Unexpected error creating pomodoro session:', error);
    return { 
      session: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

// For backward compatibility
export const completePomodoroSession = createPomodoroSession;

export const getPomodoroStats = async (userId: string): Promise<PomodoroStats | null> => {
  try {
    // Count total completed sessions
    const { count, error } = await supabase
      .from('pomodoro_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      console.error('Error fetching pomodoro stats:', error);
      return null;
    }

    // Get total minutes
    const { data: minutesData, error: minutesError } = await supabase
      .from('pomodoro_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .eq('completed', true);

    if (minutesError) {
      console.error('Error fetching pomodoro minutes:', minutesError);
      return null;
    }

    const totalMinutes = minutesData.reduce((acc, session) => acc + (session.duration_minutes || 0), 0);

    return {
      completed_count: count || 0,
      total_minutes: totalMinutes,
      streak_days: 0, // This would require more complex logic to calculate
    };
  } catch (error) {
    console.error('Unexpected error fetching pomodoro stats:', error);
    return null;
  }
};

export const getPomodoroSessions = async (userId: string): Promise<PomodoroSession[]> => {
  try {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pomodoro sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching pomodoro sessions:', error);
    return [];
  }
};
