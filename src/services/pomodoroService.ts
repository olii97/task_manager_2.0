
import { supabase } from '@/integrations/supabase/client';
import { PomodoroSession, PomodoroStats, PomodoroDistraction } from '@/types/pomodoro';

export interface CreatePomodoroSessionParams {
  user_id: string;
  duration_minutes: number;
  task_id?: string;
  completed: boolean;
}

export interface LogPomodoroDistractionParams {
  session_id: string;
  description: string;
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
        start_time: new Date().toISOString(),
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

export const completePomodoroSession = async (sessionId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const endTime = new Date().toISOString();
    
    const { error } = await supabase
      .from('pomodoro_sessions')
      .update({
        completed: true,
        end_time: endTime,
        updated_at: endTime
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error completing pomodoro session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error completing pomodoro session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const logPomodoroDistraction = async (params: LogPomodoroDistractionParams): Promise<{ distraction: PomodoroDistraction | null, error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('pomodoro_distractions')
      .insert([{
        session_id: params.session_id,
        description: params.description,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error logging pomodoro distraction:', error);
      return { distraction: null, error: error.message };
    }

    return { distraction: data, error: null };
  } catch (error) {
    console.error('Unexpected error logging pomodoro distraction:', error);
    return { 
      distraction: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

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

export const getPomodoroDistractions = async (sessionId: string): Promise<PomodoroDistraction[]> => {
  try {
    const { data, error } = await supabase
      .from('pomodoro_distractions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pomodoro distractions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching pomodoro distractions:', error);
    return [];
  }
};
