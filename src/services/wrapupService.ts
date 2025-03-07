
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/tasks';
import { JournalEntry } from '@/types/journal';
import { DailySummary } from '@/types/wrapup';
import { format } from 'date-fns';

// Modified to directly return the summary data rather than handling download
export const getDailySummary = async (
  userId: string,
  date: Date
): Promise<DailySummary | null> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Fetch journal entry for the day
    const { data: journalData, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single();
      
    if (journalError && journalError.code !== 'PGRST116') {
      console.error('Error fetching journal entry:', journalError);
    }
    
    // Fetch completed tasks for the day
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completion_date', `${dateStr}T00:00:00`)
      .lte('completion_date', `${dateStr}T23:59:59`);
      
    if (tasksError) {
      console.error('Error fetching completed tasks:', tasksError);
    }
    
    // Fetch workouts for the day
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', `${dateStr}T00:00:00`)
      .lte('start_date', `${dateStr}T23:59:59`);
      
    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
    }
    
    // Compile the daily summary
    const summary: DailySummary = {
      date: dateStr,
      journalEntry: journalData ? journalData as unknown as JournalEntry : null,
      completedTasks: tasksData ? tasksData.map(task => ({
        ...task,
        priority: task.priority as 1 | 2 | 3 | 4,
        energy_level: (task.energy_level === 'high' || task.energy_level === 'low') 
          ? task.energy_level 
          : 'high'
      })) as Task[] : [],
      workouts: workoutsData || [],
      stats: {
        tasksCompleted: tasksData ? tasksData.length : 0,
        moodScore: journalData ? journalData.mood : null,
        energyLevel: journalData ? journalData.energy : null,
        workoutCount: workoutsData ? workoutsData.length : 0,
        totalWorkoutMinutes: workoutsData 
          ? workoutsData.reduce((sum, workout) => sum + Math.floor((workout.elapsed_time || 0) / 60), 0)
          : 0
      }
    };
    
    // Store the summary in the database if needed
    // Disabled for now as we don't have a daily_summaries table
    /*
    const { error: insertError } = await supabase
      .from('daily_summaries')
      .upsert({
        user_id: userId,
        date: dateStr,
        data: summary
      });
      
    if (insertError) {
      console.error('Error storing daily summary:', insertError);
    }
    */
    
    return summary;
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return null;
  }
};
