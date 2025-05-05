import React, { useRef, useEffect } from "react";
import { Task, priorityColors, priorityEmojis, priorityBackgroundColors, energyLevelIcons, TaskCategory, TaskType } from "@/types/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Zap, Battery, Folder, BookOpen, Users, Wrench, Heart, Play, Trash2, Calendar, Briefcase, Home, Check } from "lucide-react";
import { completeTask, deleteTask } from "@/services/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { usePomodoro } from "@/components/pomodoro/PomodoroProvider";
import { cn } from "@/lib/utils";
import { toast, useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useConfetti } from "@/components/animations/GlobalConfettiContext";

const taskCategories = {
  'Consume': { label: 'Consume', icon: BookOpen, color: 'text-blue-500' },
  'Create': { label: 'Create', icon: Wrench, color: 'text-purple-500' },
  'Care': { label: 'Care', icon: Heart, color: 'text-pink-500' },
  'Connect': { label: 'Connect', icon: Users, color: 'text-green-500' }
} as const;

const taskCategoryIcons: Record<TaskCategory, string> = {
  'Consume': '📚',
  'Create': '🎨',
  'Care': '🌱',
  'Connect': '🤝'
};

// Task Type Icons
const taskTypeIcons = {
  'work': { icon: Briefcase, color: 'text-blue-500' },
  'personal': { icon: Home, color: 'text-green-500' }
} as const;

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const queryClient = useQueryClient();
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const { startPomodoro } = usePomodoro();
  const { toast } = useToast();
  const toastIdRef = useRef<string | null>(null);
  const { showConfetti } = useConfetti();
  const taskItemRef = useRef<HTMLDivElement>(null);

  const getSectionId = () => {
    if (task.energy_level === 'high') return 'high-energy-section';
    if (task.energy_level === 'low') return 'low-energy-section';
    return 'backlog-section';
  };

  // Function to trigger confetti based on task energy level
  const triggerConfetti = () => {
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Define positions for different energy levels
    let sourceX = windowWidth / 2; // Default center
    let sourceY = windowHeight * 0.2; // Default near top
    
    if (task.energy_level === 'high') {
      // Position for high energy section - left side
      sourceX = windowWidth * 0.25; // 25% from left
      sourceY = windowHeight * 0.25; // 25% from top
    } else if (task.energy_level === 'low') {
      // Position for low energy section - center
      sourceX = windowWidth * 0.5; // Center
      sourceY = windowHeight * 0.25; // 25% from top
    } else {
      // Position for backlog - right side
      sourceX = windowWidth * 0.75; // 75% from left
      sourceY = windowHeight * 0.25; // 25% from top
    }
    
    // Show confetti with the calculated position
    showConfetti({
      sourceX,
      sourceY,
      sourceWidth: windowWidth * 0.4 // 40% of screen width
    });
    
    // Add a ticker message for the completed task
    if (window.addTickerMessage) {
      window.addTickerMessage(`TASK COMPLETED: ${task.title}`);
    }
  };

  const { mutate: onToggleComplete } = useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => 
      completeTask(taskId, isCompleted),
    onSuccess: (_, variables) => {
      
      // Only show effects when completing a task
      if (variables.isCompleted) {
        // Trigger the confetti with position based on task type
        triggerConfetti();

        // Show toast
        const { id } = toast({
          description: (
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-lg text-green-400">+20 XP</span>
              <span className="text-base text-white">Task Completed</span>
              <Check className="h-5 w-5 text-green-400" />
            </div>
          ),
          className: "bg-black/80 border-green-500/50 text-white",
          duration: 3000,
        });
        
        toastIdRef.current = id;

        // Immediately invalidate queries
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        // If not completing, just invalidate immediately
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
    onError: (error) => {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  });

  const { mutate: onDeleteTask } = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const handleCheckboxChange = (checked: boolean | string) => {
    const isCompleted = checked === "indeterminate" ? false : !!checked;
    
    onToggleComplete({
      taskId: task.id,
      isCompleted: isCompleted
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  };
  
  const handleStartPomodoro = () => {
    startPomodoro(task);
  };

  // Determine energy class based on task energy level
  const energyClass = task.energy_level === 'high' ? 'high-energy-task' : 
                      task.energy_level === 'low' ? 'low-energy-task' : '';
  
  // Get the priority background color
  const priorityBgClass = priorityBackgroundColors[task.priority];

  const categoryInfo = task.category ? taskCategories[task.category] : null;
  const categoryIcon = task.category ? taskCategoryIcons[task.category] : '';
  const taskTypeInfo = task.task_type ? taskTypeIcons[task.task_type] : taskTypeIcons['personal'];

  return (
    <motion.div
      ref={taskItemRef}
      initial={task.is_completed ? { opacity: 0.8 } : { opacity: 1 }}
      animate={task.is_completed ? 
        { opacity: 0.7, x: 0 } : 
        { opacity: 1, x: 0 }
      }
      exit={{ opacity: 0, x: -10 }}
      layout
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex items-start gap-2 w-full rounded-lg p-3 mb-2 transition-colors border",
        task.is_completed && "opacity-50",
        priorityBgClass
      )}
    >
      <div className="flex-shrink-0 mr-3 mt-1">
        <Checkbox 
          ref={checkboxRef as any}
          checked={task.is_completed} 
          onCheckedChange={handleCheckboxChange}
          aria-label={task.is_completed ? "Mark as incomplete" : "Mark as complete"}
          className={task.is_completed ? "task-complete" : ""}
        />
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-sm font-medium",
            task.is_completed ? "line-through text-gray-500" : "text-slate-900"
          )}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Task Type Icon */}
            <div className={cn("flex items-center", taskTypeInfo.color)} title={task.task_type || 'Personal'}>
              <taskTypeInfo.icon className="h-3.5 w-3.5" />
            </div>
            {/* Only show the Lucide icon for the category */}
            {categoryInfo && (
              <div className={cn("flex items-center", categoryInfo.color)} title={categoryInfo.label}>
                <categoryInfo.icon className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
        {task.description && (
          <p className={`text-sm text-gray-600 ${task.is_completed ? 'line-through' : ''}`}>
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {energyLevelIcons[task.energy_level] && <span title="Energy Level">{energyLevelIcons[task.energy_level]}</span>}
          {task.due_date && (
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {!task.is_completed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-pomodoro-primary hover:bg-pomodoro-primary/10 hover:text-pomodoro-primary btn-glow"
              title="Focus Mode"
              onClick={handleStartPomodoro}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
          onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
    </motion.div>
  );
}
