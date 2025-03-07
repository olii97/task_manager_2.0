import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/tasks';

// Define a function to convert between Task and database model types
const convertToTask = (dbTask: any): Task => {
  // Ensure the priority is one of the allowed values in the Task type
  const priority = dbTask.priority as 1 | 2 | 3 | 4;
  
  // Ensure energy_level is one of the allowed values
  const energyLevel = 
    dbTask.energy_level === 'high' || dbTask.energy_level === 'low'
      ? dbTask.energy_level
      : 'high'; // Default to 'high' if invalid
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    priority: priority,
    is_completed: dbTask.is_completed,
    is_scheduled_today: dbTask.is_scheduled_today,
    energy_level: energyLevel,
    completion_date: dbTask.completion_date,
    created_at: dbTask.created_at,
    updated_at: dbTask.updated_at
  };
};

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

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    // Convert all database tasks to the Task type
    return (data || []).map(convertToTask);
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        is_completed: task.is_completed,
        is_scheduled_today: task.is_scheduled_today,
        energy_level: task.energy_level,
        completion_date: task.completion_date,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return convertToTask(data);
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    throw error;
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
