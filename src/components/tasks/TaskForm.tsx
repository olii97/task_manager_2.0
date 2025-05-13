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
import { Zap, Battery, BookOpen, Users, Wrench, Heart, Calendar, Briefcase, Home } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const taskCategories = {
  'Consume': { label: 'Consume', icon: BookOpen },
  'Create': { label: 'Create', icon: Wrench },
  'Care': { label: 'Care', icon: Heart },
  'Connect': { label: 'Connect', icon: Users }
} as const;

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  task?: Task;
  title: string;
}

export function TaskForm({ open, onClose, onSave, task, title }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: undefined,
    energy_level: undefined,
    category: undefined,
    due_date: undefined,
    task_type: "personal",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        energy_level: task.energy_level,
        category: task.category,
        due_date: task.due_date,
        task_type: task.task_type || "personal",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: undefined,
        energy_level: undefined,
        category: undefined,
        due_date: undefined,
        task_type: "personal",
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

  const handleCategoryChange = (value: TaskCategory) => {
    console.log('Category changed to:', value);
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, due_date: e.target.value }));
  };

  const handleTaskTypeChange = (value: TaskType) => {
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
            <label className="text-sm font-medium">
              Task Type
            </label>
            <RadioGroup
              value={formData.task_type}
              onValueChange={handleTaskTypeChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work" className="flex items-center cursor-pointer">
                  <Briefcase className="h-4 w-4 mr-1 text-blue-500" />
                  Work
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex items-center cursor-pointer">
                  <Home className="h-4 w-4 mr-1 text-green-500" />
                  Personal
                </Label>
              </div>
            </RadioGroup>
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
            <label htmlFor="category" className="text-sm font-medium flex items-center gap-1">
              Category (Optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-pointer text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="text-xs text-left space-y-2">
                      <div>
                        <span className="font-semibold text-blue-500">Consume:</span> Reading, learning, watching, or absorbing information. Examples: books, articles, videos, podcasts, courses.
                      </div>
                      <div>
                        <span className="font-semibold text-purple-500">Create:</span> Making, building, writing, or producing something new. Examples: coding, writing, designing, crafting, cooking.
                      </div>
                      <div>
                        <span className="font-semibold text-pink-500">Care:</span> Self-care, health, wellness, or helping others. Examples: exercise, meditation, doctor appointments, helping family/friends.
                      </div>
                      <div>
                        <span className="font-semibold text-green-500">Connect:</span> Socializing, networking, or building relationships. Examples: meetings, calls, events, social gatherings, emails.
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              Priority (Optional)
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
              Energy Level (Optional)
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
            <label htmlFor="due_date" className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Due Date (Optional)
            </label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date || ""}
              onChange={handleDueDateChange}
              className="w-full"
            />
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
