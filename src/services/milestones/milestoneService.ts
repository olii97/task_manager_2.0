import { supabase } from "@/supabaseClient";
import { Milestone, CreateMilestone, UpdateMilestone } from "@/types/milestones";
import { toast } from "@/hooks/use-toast";

// Define a type for creating milestones, excluding database-generated fields
type CreateMilestone = Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;

/**
 * Fetch all milestones for a specific user
 */
export const fetchMilestones = async (userId: string): Promise<Milestone[]> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data as Milestone[];
  } catch (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }
};

// Fetch milestones for a specific project - REMOVED as projects are removed
// export const fetchProjectMilestones = async (projectId: string): Promise<Milestone[]> => {
//   // ... removed code ...
// };

/**
 * Add a new milestone for a user
 */
export const addMilestone = async (milestone: CreateMilestone): Promise<Milestone> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Milestone created",
      description: "Your milestone has been created successfully.",
    });

    return data as Milestone;
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
};

/**
 * Update an existing milestone
 */
export const updateMilestone = async (
  milestoneId: string,
  updates: UpdateMilestone
): Promise<Milestone> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Milestone updated",
      description: "Your milestone has been updated successfully.",
    });

    return data as Milestone;
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

/**
 * Delete a milestone
 */
export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;

    toast({
      title: "Milestone deleted",
      description: "Your milestone has been deleted successfully.",
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
}; 