import { supabase } from "@/supabaseClient";
import { Project } from "@/types/projects";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch all projects for a user
 */
export const fetchProjects = async (userId: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(project => ({
      ...project,
      milestones: project.milestones || []
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

/**
 * Add a new project
 */
export const addProject = async (
  userId: string, 
  project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({ 
        ...project, 
        user_id: userId,
        milestones: project.milestones || []
      })
      .select('*')
      .single();
      
    if (error) throw error;
    
    toast({
      title: "Project created",
      description: "Your project has been created successfully.",
    });
    
    return data as Project;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (
  projectId: string, 
  updates: Partial<Project>
): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        milestones: updates.milestones || []
      })
      .eq('id', projectId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    toast({
      title: "Project updated",
      description: "Your project has been updated successfully.",
    });
    
    return data as Project;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) throw error;
    
    toast({
      title: "Project deleted",
      description: "Your project has been deleted successfully.",
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Get tasks for a specific project
 */
export const getProjectTasks = async (projectId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    return count || 0;
  } catch (error) {
    console.error('Error counting project tasks:', error);
    return 0;
  }
}; 