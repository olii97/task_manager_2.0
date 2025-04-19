import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from '@/types/tasks';
import { Project } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Battery, BookOpen, Users, Wrench, Heart, Briefcase, Home, Check, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateProject } from '@/services/projects/projectService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { deleteTask } from '@/services/tasks';
import { analyzeBulkTasksText } from '@/services/quickTaskService';

const taskCategories = {
  'Consume': { label: 'Consume', icon: BookOpen, color: 'text-blue-500' },
  'Create': { label: 'Create', icon: Wrench, color: 'text-purple-500' },
  'Care': { label: 'Care', icon: Heart, color: 'text-pink-500' },
  'Connect': { label: 'Connect', icon: Users, color: 'text-green-500' }
} as const;

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  open: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function ProjectDetailView({ 
  project, 
  tasks, 
  open, 
  onClose, 
  onAddTask,
  onEditTask 
}: ProjectDetailViewProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const queryClient = useQueryClient();
  
  // New state for Bulk Task Creation
  const [bulkTasksInput, setBulkTasksInput] = useState('');
  const [bulkTasksPreview, setBulkTasksPreview] = useState<Array<Omit<Task, "id" | "created_at" | "updated_at">> | null>(null);
  const [isAnalyzingBulk, setIsAnalyzingBulk] = useState(false);

  // Reset title and description when project changes
  React.useEffect(() => {
    setTitle(project.name);
    setDescription(project.description || '');
  }, [project]);

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
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Project title cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateProjectMutation({ name: title });
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    updateProjectMutation({ description: description || null });
    setEditingDescription(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitle(project.name);
      setEditingTitle(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDescription(project.description || '');
      setEditingDescription(false);
    }
  };

  const handleDeleteTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task edit dialog from opening
    
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      deleteTaskMutation(task.id);
    }
  };

  // New handler for analyzing bulk tasks
  const handleAnalyzeBulkTasks = async () => {
    setIsAnalyzingBulk(true);
    try {
      const tasks = await analyzeBulkTasksText(bulkTasksInput);
      setBulkTasksPreview(tasks);
    } catch (error) {
      console.error('Error analyzing bulk tasks:', error);
    } finally {
      setIsAnalyzingBulk(false);
    }
  };

  // New handler for confirming bulk tasks creation
  const handleConfirmBulkTasks = () => {
    toast({
      title: "Bulk tasks added",
      description: "The bulk tasks have been added to your project.",
    });
    console.log("Bulk tasks to add:", bulkTasksPreview);
    // Here you would typically call an API or update state to add the new tasks
    setBulkTasksInput('');
    setBulkTasksPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Project Header */}
          <div className="w-full flex flex-col h-full">
            <div className="flex flex-col p-6 border-b">
              <div className="flex items-center justify-between mb-2">
                {editingTitle ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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
                    <h2 className="text-2xl font-semibold cursor-pointer hover:text-blue-500 transition-colors" onClick={() => setEditingTitle(true)}>
                      {title}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {editingDescription ? (
                <div className="flex flex-col gap-2">
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                  onClick={() => setEditingDescription(true)}
                >
                  {description || 'Add a description...'}
                </div>
              )}
            </div>

            {/* Bulk Task Creation Section */}
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium mb-2">Convert Thoughts to Tasks (ChatGPT-4)</h3>
              <Textarea 
                value={bulkTasksInput}
                onChange={(e) => setBulkTasksInput(e.target.value)}
                placeholder="Enter your thoughts here. Each new line will be treated as a separate task idea."
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleAnalyzeBulkTasks} disabled={isAnalyzingBulk || !bulkTasksInput.trim()}>
                  {isAnalyzingBulk ? 'Converting...' : 'Convert Thoughts'}
                </Button>
                {bulkTasksPreview && bulkTasksPreview.length > 0 && (
                  <Button variant="secondary" onClick={handleConfirmBulkTasks}>
                    Add Tasks to Project
                  </Button>
                )}
              </div>
              {bulkTasksPreview && bulkTasksPreview.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Preview:</p>
                  <ul className="list-disc ml-6">
                    {bulkTasksPreview.map((task, index) => (
                      <li key={index}>
                        {task.title}{task.description ? ` - ${task.description}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex flex-col gap-2 rounded-lg border p-4 hover:border-accent transition-colors cursor-pointer"
                    onClick={() => onEditTask(task)}
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
                            {task.energy_level === "high" && (
                              <Zap className="h-4 w-4 text-energy-high" />
                            )}
                            {task.energy_level === "low" && (
                              <Battery className="h-4 w-4 text-energy-low" />
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

                {tasks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No tasks in this project yet.</p>
                  </div>
                )}
              </div>
              
              {/* Add Task Button at the bottom */}
              <div className="mt-6 flex justify-center">
                <Button onClick={onAddTask} className="w-full max-w-xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 