
import { supabase } from '@/integrations/supabase/client';
import { DailySummary } from '@/types/wrapup';
import { format } from 'date-fns';
import { Task } from '@/types/tasks';
import { JournalEntry, mapDatabaseEntryToJournalEntry } from '@/types/journal';

export interface PomodoroStats {
  completed_count: number;
  total_minutes: number;
  streak_days: number;
}

/**
 * Gets daily summary for a specific date
 */
export const getDailySummary = async (userId: string, date: Date): Promise<DailySummary | null> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Note: This is a temporary fix - You need to create the daily_summaries table
    // Comment out this section as the table doesn't exist yet
    /*
    // Check if we already have a stored summary
    const { data: existingSummary } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single();
      
    if (existingSummary) {
      return existingSummary as DailySummary;
    }
    */
    
    // Get completed tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completion_date', `${dateStr}T00:00:00`)
      .lte('completion_date', `${dateStr}T23:59:59`);
      
    // Get journal entry
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr);
      
    // Get pomodoro sessions
    const { data: pomodoroSessions } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('start_time', `${dateStr}T00:00:00`)
      .lte('start_time', `${dateStr}T23:59:59`);
      
    // Get strava activities
    const { data: stravaActivities } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', `${dateStr}T00:00:00`)
      .lte('start_date', `${dateStr}T23:59:59`);
      
    // Create summary
    const tasks = tasksData ? tasksData.map(task => {
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as 1 | 2 | 3 | 4,
        energy_level: task.energy_level as 'high' | 'low' | undefined,
        is_completed: task.is_completed,
        is_scheduled_today: task.is_scheduled_today,
        completion_date: task.completion_date,
        created_at: task.created_at,
        updated_at: task.updated_at
      } as Task;
    }) : [];
    
    const journalEntry = journalEntries?.length 
      ? mapDatabaseEntryToJournalEntry(journalEntries[0]) 
      : null;

    const summary: DailySummary = {
      id: crypto.randomUUID(),
      user_id: userId,
      date: dateStr,
      tasks_completed: tasks?.length || 0,
      tasks: tasks || [],
      journal_entry: journalEntry,
      pomodoro_sessions: pomodoroSessions?.length || 0,
      pomodoro_minutes: pomodoroSessions?.reduce((total, session) => total + (session.duration_minutes || 0), 0) || 0,
      strava_activities: stravaActivities?.map(activity => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        summary_polyline: activity.summary_polyline || ''
      })) || [],
      created_at: new Date().toISOString()
    };
    
    // Save the summary to the database for future reference
    // Comment out as the table doesn't exist yet
    /*
    await supabase
      .from('daily_summaries')
      .insert(summary);
    */
      
    return summary;
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return null;
  }
};

/**
 * Gets pomodoro stats for a user
 */
export const getPomodoroStats = async (userId: string): Promise<PomodoroStats> => {
  try {
    // Get total completed pomodoros
    const { count: completedCount } = await supabase
      .from('pomodoro_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true);
      
    // Get total minutes
    const { data: sessions } = await supabase
      .from('pomodoro_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .eq('completed', true);
    
    const totalMinutes = sessions?.reduce((total, session) => total + (session.duration_minutes || 0), 0) || 0;
    
    // Simplified streak calculation (dummy implementation)
    const streakDays = 1;
    
    return {
      completed_count: completedCount || 0,
      total_minutes: totalMinutes,
      streak_days: streakDays
    };
  } catch (error) {
    console.error('Error getting pomodoro stats:', error);
    return {
      completed_count: 0,
      total_minutes: 0,
      streak_days: 0
    };
  }
};
