
import { supabase } from "@/integrations/supabase/client";
import { PomodoroSession, PomodoroDistraction, DistractionInput } from "@/types/pomodoro";
import { toast } from "@/hooks/use-toast";
import { addTaskCompletionXP } from "./tasks/taskXpService";

export const startPomodoroSession = async (
  userId: string,
  taskId: string,
  durationMinutes: number
): Promise<PomodoroSession | null> => {
  try {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .insert({
        user_id: userId,
        task_id: taskId,
        duration_minutes: durationMinutes,
        start_time: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error starting Pomodoro session:", error);
      throw error;
    }

    return data as PomodoroSession;
  } catch (error) {
    console.error("Error in startPomodoroSession:", error);
    return null;
  }
};

export const completePomodoroSession = async (
  sessionId: string,
  taskTitle: string
): Promise<PomodoroSession | null> => {
  try {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .update({
        completed: true,
        end_time: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select("*")
      .single();

    if (error) {
      console.error("Error completing Pomodoro session:", error);
      throw error;
    }

    // Only add XP if we successfully marked the session as completed
    if (data) {
      try {
        await supabase
          .from("user_xp")
          .insert({
            user_id: data.user_id,
            xp_amount: 20,
            reason: `Completed Pomodoro session for: ${taskTitle}`,
          });

        toast({
          title: "+20 XP!",
          description: "You earned XP for completing a Pomodoro session!",
          className: "bg-yellow-100 border-yellow-400",
        });
      } catch (xpError) {
        console.error("Error adding XP for Pomodoro:", xpError);
      }
    }

    return data as PomodoroSession;
  } catch (error) {
    console.error("Error in completePomodoroSession:", error);
    return null;
  }
};

export const addPomodoroDistraction = async (
  sessionId: string,
  distraction: DistractionInput
): Promise<PomodoroDistraction | null> => {
  try {
    const { data, error } = await supabase
      .from("pomodoro_distractions")
      .insert({
        session_id: sessionId,
        description: distraction.description,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding Pomodoro distraction:", error);
      throw error;
    }

    return data as PomodoroDistraction;
  } catch (error) {
    console.error("Error in addPomodoroDistraction:", error);
    return null;
  }
};

export const getPomodoroSessionsByUser = async (
  userId: string,
  limit: number = 10
): Promise<PomodoroSession[]> => {
  try {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("start_time", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching Pomodoro sessions:", error);
      throw error;
    }

    return data as PomodoroSession[];
  } catch (error) {
    console.error("Error in getPomodoroSessionsByUser:", error);
    return [];
  }
};

export const getPomodoroSessionsCompletedToday = async (
  userId: string
): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("start_time", today.toISOString());

    if (error) {
      console.error("Error fetching today's Pomodoro sessions:", error);
      throw error;
    }

    return data.length;
  } catch (error) {
    console.error("Error in getPomodoroSessionsCompletedToday:", error);
    return 0;
  }
};
