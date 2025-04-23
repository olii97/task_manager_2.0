import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from '@/types/tasks';
import { Project } from '@/types/projects';
import { Milestone } from '@/types/milestones';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users, Wrench, Heart, Briefcase, Home, Check, Edit2, Trash2, Calendar, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateProject } from '@/services/projects/projectService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { deleteTask } from '@/services/tasks';
import { 
  fetchProjectMilestones, 
  addMilestone, 
  updateMilestone, 
  deleteMilestone 
} from '@/services/milestones/milestoneService';
import { useAuth } from '@/components/AuthProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const taskCategories = {
  'Consume': { label: 'Consume', icon: BookOpen, color: 'text-blue-500' },
  'Create': { label: 'Create', icon: Wrench, color: 'text-purple-500' },
  'Care': { label: 'Care', icon: Heart, color: 'text-pink-500' },
  'Connect': { label: 'Connect', icon: Users, color: 'text-green-500' }
} as const;

interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function ProjectDetailView({
  project,
  onClose,
  onUpdateProject,
  onDeleteProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: ProjectDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
  const [newMilestone, setNewMilestone] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (project.id) {
      fetchProjectMilestones(project.id).then(setMilestones);
    }
  }, [project.id]);

  // Create mutation for updating project
  const { mutate: updateProjectMutation, isPending } = useMutation({
    mutationFn: (updates: Partial<Project>) => updateProject(project.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating project",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating project:', error);
    }
  });

  // Create mutation for deleting tasks
  const { mutate: deleteTaskMutation } = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting task",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive"
      });
      console.error('Error deleting task:', error);
    }
  });

  const handleSaveTitle = () => {
    if (!editedProject.name.trim()) {
      toast({
        title: "Error",
        description: "Project title cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateProjectMutation({ name: editedProject.name });
    setIsEditing(false);
  };

  const handleSaveDescription = () => {
    updateProjectMutation({ description: editedProject.description || null });
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedProject(project);
      setIsEditing(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditedProject(project);
      setIsEditing(false);
    }
  };

  const handleDeleteTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task edit dialog from opening
    
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      deleteTaskMutation(task.id);
    }
  };

  const handleAddTaskClick = () => {
    if (!user) return;
    onAddTask({
      title: "New Task",
      description: "",
      priority: 2,
      task_type: project.project_type,
      category: "Create",
      is_completed: false,
      is_scheduled_today: false,
      user_id: user.id,
      project_id: project.id,
      energy_level: undefined,
      due_date: null
    });
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim() || !user) {
      toast({
        title: "Error",
        description: "Milestone title and date are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const milestone = await addMilestone({
        project_id: project.id,
        title: newMilestone,
        date: new Date().toISOString().split('T')[0],
        description: '',
        is_completed: false,
        is_main: false,
        user_id: user.id
      });

      setMilestones(prev => [...prev, milestone]);
      setNewMilestone('');
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    try {
      const updatedMilestone = await updateMilestone(milestoneId, updates);
      setMilestones(prev => 
        prev.map(m => m.id === milestoneId ? updatedMilestone : m)
      );
      setEditingMilestone(null);
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const handleSaveProjectType = (value: 'work' | 'personal') => {
    updateProjectMutation({ project_type: value });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Project Header */}
          <div className="w-full flex flex-col h-full">
            <div className="flex flex-col p-6 border-b">
              <div className="flex items-center justify-between mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      value={editedProject.name}
                      onChange={(e) => setEditedProject(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xl font-semibold"
                      autoFocus
                      onKeyDown={handleTitleKeyDown}
                      disabled={isPending}
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveTitle} disabled={isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold cursor-pointer hover:text-blue-500 transition-colors" onClick={() => setIsEditing(true)}>
                      {editedProject.name}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Project Type Selection */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Project Type:</span>
                <Select
                  value={editedProject.project_type}
                  onValueChange={handleSaveProjectType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Work</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="personal">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span>Personal</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Textarea 
                    value={editedProject.description || ''}
                    onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px] text-muted-foreground"
                    placeholder="Add a description..."
                    autoFocus
                    onKeyDown={handleDescriptionKeyDown}
                    disabled={isPending}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleSaveDescription} disabled={isPending}>
                      Save Description
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-muted-foreground cursor-pointer hover:text-blue-500 transition-colors min-h-[40px]"
                  onClick={() => setIsEditing(true)}
                >
                  {editedProject.description || 'Add a description...'}
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Column - Tasks List */}
              <div className="w-2/3 overflow-auto p-6 border-r">
                <div className="grid gap-4">
                  {(project.tasks || []).map((task) => (
                    <div
                      key={task.id}
                      className="group flex flex-col gap-2 rounded-lg border p-4 hover:border-accent transition-colors cursor-pointer"
                      onClick={() => onUpdateTask(task)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{task.title}</span>
                            <div className="flex items-center gap-1.5">
                              {task.category && (
                                <div 
                                  className={cn("flex items-center", taskCategories[task.category].color)} 
                                  title={taskCategories[task.category].label}
                                >
                                  {React.createElement(taskCategories[task.category].icon, {
                                    className: "h-4 w-4"
                                  })}
                                </div>
                              )}
                              {task.task_type === "work" ? (
                                <Briefcase className="h-4 w-4" />
                              ) : (
                                <Home className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                            P{task.priority}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDeleteTask(task, e)}
                            title="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!project.tasks || project.tasks.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No tasks in this project yet.</p>
                    </div>
                  )}
                </div>
                
                {/* Add Task Button at the bottom */}
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleAddTaskClick} className="w-full max-w-xs">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>

              {/* Right Column - Milestones */}
              <div className="w-1/3 overflow-auto p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Milestones
                </h3>
                <div className="space-y-4">
                  {/* Add New Milestone Form */}
                  <div className="space-y-2 p-4 border rounded-lg">
                    <Input
                      placeholder="Milestone title"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                    />
                    <Button onClick={handleAddMilestone} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>

                  {/* Milestones List */}
                  <div className="space-y-3">
                    {milestones.map(milestone => (
                      <div 
                        key={milestone.id}
                        className={cn(
                          "p-3 border rounded-lg",
                          milestone.is_completed && "opacity-50"
                        )}
                      >
                        {editingMilestone === milestone ? (
                          <div className="space-y-2">
                            <Input
                              value={milestone.title}
                              onChange={(e) => handleUpdateMilestone(milestone.id, { title: e.target.value })}
                            />
                            <Input
                              type="date"
                              value={milestone.date}
                              onChange={(e) => handleUpdateMilestone(milestone.id, { date: e.target.value })}
                            />
                            <Textarea
                              value={milestone.description}
                              onChange={(e) => handleUpdateMilestone(milestone.id, { description: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingMilestone(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteMilestone(milestone.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingMilestone(milestone)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleUpdateMilestone(milestone.id, { is_completed: !milestone.is_completed })}
                                >
                                  <Check className={cn(
                                    "h-4 w-4",
                                    milestone.is_completed ? "text-green-500" : "text-muted-foreground"
                                  )} />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(milestone.date).toLocaleDateString()}</span>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {milestones.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No milestones yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 