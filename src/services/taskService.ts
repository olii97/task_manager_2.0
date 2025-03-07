
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/tasks';

export const markTaskComplete = async (taskId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        is_completed: true,
        completion_date: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error marking task as complete:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error marking task as complete:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    // Convert database priority to Task priority (1|2|3|4)
    return (data || []).map(task => ({
      ...task,
      priority: task.priority >= 1 && task.priority <= 4 ? (task.priority as 1|2|3|4) : 4
    }));
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    return [];
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<{ task: Task | null, error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: task.title,
        description: task.description,
        priority: task.priority,
        energy_level: task.energy_level,
        is_completed: task.is_completed,
        is_scheduled_today: task.is_scheduled_today,
        user_id: task.user_id,
        completion_date: task.completion_date
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return { task: null, error: error.message };
    }

    // Convert to Task type with correct priority typing
    const typedTask: Task = {
      ...data,
      priority: data.priority >= 1 && data.priority <= 4 ? (data.priority as 1|2|3|4) : 4
    };

    return { task: typedTask, error: null };
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    return { 
      task: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error updating task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const deleteTask = async (taskId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};
