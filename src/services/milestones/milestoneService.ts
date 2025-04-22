import { supabase } from "@/supabaseClient";
import { Milestone } from "@/types/milestones";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch all milestones for a project
 */
export const fetchProjectMilestones = async (projectId: string): Promise<Milestone[]> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('is_main', { ascending: false })
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    return data.map(m => ({
      ...m,
      is_main: m.is_main ?? false
    })) as Milestone[];
  } catch (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }
};

/**
 * Add a new milestone
 */
type CreateMilestone = Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;

export const addMilestone = async (milestone: CreateMilestone): Promise<Milestone> => {
  try {
    const milestoneData = {
      ...milestone,
      is_main: milestone.is_main ?? false, 
    };
    
    const { data, error } = await supabase
      .from('milestones')
      .insert(milestoneData)
      .select('*')
      .single();
      
    if (error) throw error;
    
    toast({
      title: "Milestone added",
      description: "Your milestone has been added successfully.",
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
type UpdateMilestone = Partial<Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'project_id' | 'user_id'>>;

export const updateMilestone = async (
  milestoneId: string, 
  updates: UpdateMilestone
): Promise<Milestone> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select('*')
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