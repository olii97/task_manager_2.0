
import { supabase } from "@/integrations/supabase/client";
import { Goal, GoalCategory } from "@/types/goals";

export const getGoalsForQuarter = async (quarter: number, year: number) => {
  const { data, error } = await supabase
    .from("quarterly_goals")
    .select("*")
    .eq("quarter", quarter)
    .eq("year", year)
    .order("category");

  if (error) throw error;
  
  // Map database fields to our frontend model
  return (data || []).map(item => ({
    ...item,
    isCompleted: item.is_completed // Map is_completed to isCompleted
  })) as Goal[];
};

export const getCurrentQuarterGoals = async () => {
  const { quarter, year } = getCurrentQuarter();
  return getGoalsForQuarter(quarter, year);
};

export const getFeaturedGoal = async () => {
  const goals = await getCurrentQuarterGoals();
  if (!goals || goals.length === 0) return null;
  
  // Get a random goal or cycle through them based on the day
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return goals[dayOfYear % goals.length] || null;
};

export const createGoal = async (goal: Omit<Goal, "id" | "created_at" | "updated_at">) => {
  // Convert our frontend model to database fields
  const dbGoal = {
    user_id: goal.user_id,
    category: goal.category,
    description: goal.description,
    is_completed: goal.isCompleted, // Map isCompleted to is_completed
    quarter: goal.quarter,
    year: goal.year
  };

  const { data, error } = await supabase
    .from("quarterly_goals")
    .insert(dbGoal)
    .select()
    .single();

  if (error) throw error;
  
  // Map database response back to our frontend model
  return {
    ...data,
    isCompleted: data.is_completed // Map is_completed to isCompleted
  } as Goal;
};

export const updateGoal = async (goalId: string, updates: Partial<Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">>) => {
  // Convert our frontend model updates to database fields
  const dbUpdates: Record<string, any> = {};
  
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
  if (updates.quarter !== undefined) dbUpdates.quarter = updates.quarter;
  if (updates.year !== undefined) dbUpdates.year = updates.year;

  const { data, error } = await supabase
    .from("quarterly_goals")
    .update(dbUpdates)
    .eq("id", goalId)
    .select()
    .single();

  if (error) throw error;
  
  // Map database response back to our frontend model
  return {
    ...data,
    isCompleted: data.is_completed // Map is_completed to isCompleted
  } as Goal;
};

export const deleteGoal = async (goalId: string) => {
  const { error } = await supabase
    .from("quarterly_goals")
    .delete()
    .eq("id", goalId);

  if (error) throw error;
  return true;
};

export const isQuarterEnd = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  
  // Fix the quarter end detection logic
  return (
    (day >= 25 && month === 3) || // End of Q1
    (day >= 25 && month === 6) || // End of Q2
    (day >= 25 && month === 9) || // End of Q3
    (day >= 25 && month === 12)   // End of Q4
  );
};

export const getCurrentQuarter = (): { quarter: number; year: number } => {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  const year = now.getFullYear();
  
  return { quarter, year };
};

export const getNextQuarter = (): { quarter: number; year: number } => {
  const { quarter, year } = getCurrentQuarter();
  
  if (quarter === 4) {
    return { quarter: 1, year: year + 1 };
  } else {
    return { quarter: quarter + 1, year };
  }
};
