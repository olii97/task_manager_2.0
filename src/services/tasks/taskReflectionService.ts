import { supabase } from "@/supabaseClient";
import { Task } from "@/types/tasks";

export async function shouldShowWeeklyReflection(userId: string): Promise<boolean> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Only show on Fridays (5)
  if (dayOfWeek !== 5) return false;

  // Check if we already have a reflection for today
  const todayStr = today.toISOString().split('T')[0];
  const { data: existingEntry, error } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .eq('entry_type', 'weekly_task_reflection')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking for existing reflection:', error);
    return false;
  }

  return !existingEntry;
}

export async function getWeeklyCompletedTasks(userId: string): Promise<Task[]> {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .gte('completion_date', lastWeek.toISOString())
    .lte('completion_date', today.toISOString())
    .order('completion_date', { ascending: false });

  if (error) {
    console.error('Error fetching completed tasks:', error);
    return [];
  }

  // Transform the data to match the Task type
  return (tasks || []).map(task => ({
    ...task,
    priority: task.priority as 1 | 2 | 3 | 4,
    energy_level: task.energy_level === 'high' || task.energy_level === 'low' 
      ? task.energy_level 
      : undefined
  }));
}

export function getOpenAIApiKey(): string | null {
  return localStorage.getItem('openai_api_key');
}

export function saveOpenAIApiKey(apiKey: string): void {
  localStorage.setItem('openai_api_key', apiKey);
} 