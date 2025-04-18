import React, { useState, useEffect } from "react";
import { Task, priorityLabels, TaskCategory, TaskType } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Zap, Battery, Folder, BookOpen, Users, Wrench, Heart, Briefcase, Home } from "lucide-react";
import { Project } from "@/types/projects";

const taskCategories = {
  'Consume': { label: 'Consume', icon: BookOpen },
  'Create': { label: 'Create', icon: Wrench },
  'Care': { label: 'Care', icon: Heart },
  'Connect': { label: 'Connect', icon: Users }
} as const;

const taskTypes = {
  'work': { label: 'Work', icon: Briefcase },
  'personal': { label: 'Personal', icon: Home }
} as const;

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  task?: Task;
  title: string;
  projects?: Project[];
}

export function TaskForm({ open, onClose, onSave, task, title, projects = [] }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: 4,
    energy_level: undefined,
    project_id: undefined,
    category: undefined,
    task_type: 'work',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        energy_level: task.energy_level,
        project_id: task.project_id,
        category: task.category,
        task_type: task.task_type,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: 4,
        energy_level: undefined,
        project_id: undefined,
        category: undefined,
        task_type: 'work',
      });
    }
  }, [task, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, priority: Number(value) as 1 | 2 | 3 | 4 }));
  };

  const handleEnergyLevelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, energy_level: value as 'high' | 'low' }));
  };

  const handleProjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, project_id: value === "none" ? undefined : value }));
  };

  const handleCategoryChange = (value: TaskCategory) => {
    console.log('Category changed to:', value);
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleTaskTypeChange = (value: TaskType) => {
    console.log('Task type changed to:', value);
    setFormData((prev) => ({ ...prev, task_type: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Task Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Add any details about this task"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category">
                  {formData.category && (
                    <div className="flex items-center">
                      {taskCategories[formData.category].icon && (
                        <div className="mr-2">
                          {React.createElement(taskCategories[formData.category].icon, {
                            className: "h-4 w-4"
                          })}
                        </div>
                      )}
                      {taskCategories[formData.category].label}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(taskCategories).map(([value, { label, icon: Icon }]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <Select
              value={formData.priority?.toString()}
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Energy Level
            </label>
            <RadioGroup
              value={formData.energy_level}
              onValueChange={handleEnergyLevelChange}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex items-center cursor-pointer">
                  <Zap className="h-4 w-4 mr-1 text-energy-high" />
                  High Energy
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex items-center cursor-pointer">
                  <Battery className="h-4 w-4 mr-1 text-energy-low" />
                  Low Energy
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Task Type
            </label>
            <RadioGroup
              value={formData.task_type}
              onValueChange={handleTaskTypeChange}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work" className="flex items-center cursor-pointer">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Work
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex items-center cursor-pointer">
                  <Home className="h-4 w-4 mr-1" />
                  Personal
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium flex items-center">
              <Folder className="h-4 w-4 mr-1" />
              Project (Optional)
            </label>
            <Select
              value={formData.project_id || "none"}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Array.isArray(projects) && projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
