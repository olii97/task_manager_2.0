import { supabase } from "@/supabaseClient";
import { Task } from "@/types/tasks";

/**
 * Fetch all tasks for a user
 */
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Ensure proper typing for all tasks
    return data.map(task => ({
      ...task,
      priority: task.priority as 1 | 2 | 3 | 4,
      energy_level: task.energy_level as 'high' | 'low' | undefined
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Add a new task
 */
export const addTask = async (
  userId: string, 
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: userId })
      .select('*')
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      priority: data.priority as 1 | 2 | 3 | 4,
      energy_level: data.energy_level as 'high' | 'low' | undefined
    };
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (
  taskId: string, 
  updates: Partial<Task>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      priority: data.priority as 1 | 2 | 3 | 4,
      energy_level: data.energy_level as 'high' | 'low' | undefined
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Mark a task as completed or incomplete
 */
export const completeTask = async (
  taskId: string, 
  isCompleted: boolean
): Promise<Task> => {
  try {
    const updates: Partial<Task> = {
      is_completed: isCompleted,
    };
    
    // Set completion_date when completing a task, remove it when uncompleting
    if (isCompleted) {
      updates.completion_date = new Date().toISOString();
    } else {
      updates.completion_date = null as any;
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      priority: data.priority as 1 | 2 | 3 | 4,
      energy_level: data.energy_level as 'high' | 'low' | undefined
    };
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Reset daily schedule by unmarking all tasks as scheduled for today
 */
export const resetDailySchedule = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ is_scheduled_today: false })
      .eq('user_id', userId)
      .eq('is_completed', false);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error resetting daily schedule:', error);
    throw error;
  }
};

/**
 * Schedules or unschedules a task for today, optionally setting the energy level
 */
export const scheduleTaskForToday = async (
  taskId: string, 
  isScheduled: boolean, 
  energyLevel?: 'high' | 'low'
): Promise<Task> => {
  try {
    const updates: Partial<Task> = {
      is_scheduled_today: isScheduled,
    };
    
    // Only update energy level if specified and task is being scheduled
    if (isScheduled && energyLevel) {
      updates.energy_level = energyLevel;
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Ensure proper typing for the task data
    return {
      ...data,
      priority: data.priority as 1 | 2 | 3 | 4,
      energy_level: data.energy_level as 'high' | 'low' | undefined
    };
  } catch (error) {
    console.error('Error scheduling task:', error);
    throw error;
  }
}; 