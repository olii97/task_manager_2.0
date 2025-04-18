import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from '@/types/tasks';
import { Project } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { Plus, X, Zap, Battery, BookOpen, Users, Wrench, Heart, Briefcase, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Project Header */}
          <div className="w-full flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold">{project.name}</h2>
                <p className="text-muted-foreground">{project.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onAddTask} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
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
                      </div>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No tasks in this project yet.</p>
                    <Button onClick={onAddTask} variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add your first task
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 