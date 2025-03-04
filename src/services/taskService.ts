
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";
import { toast } from "@/hooks/use-toast";

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }

    return data as Task[];
  } catch (error) {
    console.error("Error in fetchTasks:", error);
    throw error;
  }
};

export const addTask = async (
  userId: string,
  taskData: Omit<Task, "id" | "created_at" | "updated_at">
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        ...taskData,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding task:", error);
      throw error;
    }

    toast({
      title: "Task added",
      description: "Your task has been added successfully.",
    });

    return data as Task;
  } catch (error) {
    console.error("Error in addTask:", error);
    throw error;
  }
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }

    return data as Task;
  } catch (error) {
    console.error("Error in updateTask:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }

    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    throw error;
  }
};

export const completeTask = async (
  taskId: string,
  isCompleted: boolean
): Promise<Task> => {
  try {
    const updates: Partial<Task> = {
      is_completed: isCompleted,
      completion_date: isCompleted ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error completing task:", error);
      throw error;
    }

    // Add XP if task is completed and is P1
    if (isCompleted && data.priority === 1) {
      await addTaskCompletionXP(data.user_id, data.title);
    }

    return data as Task;
  } catch (error) {
    console.error("Error in completeTask:", error);
    throw error;
  }
};

export const scheduleTaskForToday = async (
  taskId: string,
  isScheduled: boolean,
  energyLevel?: 'high' | 'low'
): Promise<Task> => {
  try {
    const updates: Partial<Task> = {
      is_scheduled_today: isScheduled,
      energy_level: energyLevel || null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error scheduling task:", error);
      throw error;
    }

    return data as Task;
  } catch (error) {
    console.error("Error in scheduleTaskForToday:", error);
    throw error;
  }
};

export const bulkScheduleTasks = async (
  taskIds: string[],
  energyLevel: 'high' | 'low'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ 
        is_scheduled_today: true, 
        energy_level: energyLevel 
      })
      .in("id", taskIds);

    if (error) {
      console.error("Error bulk scheduling tasks:", error);
      throw error;
    }

    toast({
      title: "Tasks scheduled",
      description: `${taskIds.length} tasks have been scheduled for today.`,
    });
  } catch (error) {
    console.error("Error in bulkScheduleTasks:", error);
    throw error;
  }
};

export const resetDailySchedule = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ is_scheduled_today: false, energy_level: null })
      .eq("user_id", userId)
      .eq("is_completed", false);

    if (error) {
      console.error("Error resetting daily schedule:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in resetDailySchedule:", error);
    throw error;
  }
};

// XP related functions
export const addTaskCompletionXP = async (
  userId: string,
  taskTitle: string
): Promise<void> => {
  try {
    await supabase
      .from("user_xp")
      .insert({
        user_id: userId,
        xp_amount: 20, // P1 tasks give 20 XP
        reason: `Completed P1 task: ${taskTitle}`,
      });

    toast({
      title: "+20 XP!",
      description: "You earned XP for completing a high-priority task!",
    });
  } catch (error) {
    console.error("Error adding XP:", error);
  }
};

export const getUserTotalXP = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("user_xp")
      .select("xp_amount")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user XP:", error);
      throw error;
    }

    return data.reduce((total, record) => total + record.xp_amount, 0);
  } catch (error) {
    console.error("Error in getUserTotalXP:", error);
    return 0;
  }
};
