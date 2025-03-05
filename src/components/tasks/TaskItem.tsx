
import React, { useState, useRef, useEffect } from "react";
import { Task, priorityColors, priorityEmojis } from "@/types/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Timer, Play } from "lucide-react";
import { completeTask, deleteTask } from "@/services/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";
import { FloatingXP } from "@/components/animations/FloatingXP";
import { usePomodoro } from "@/components/pomodoro/PomodoroProvider";

interface TaskItemProps {
  task: Task;
  onEditTask: (task: Task) => void;
}

export function TaskItem({ task, onEditTask }: TaskItemProps) {
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpPosition, setXpPosition] = useState({ x: 0, y: 0 });
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const { startPomodoro } = usePomodoro();

  const { mutate: onToggleComplete } = useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => 
      completeTask(taskId, isCompleted),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      // Only show confetti and XP when completing a task, not uncompleting
      if (variables.isCompleted) {
        setShowConfetti(true);
        
        // Show XP animation for P1 tasks
        if (task.priority === 1) {
          setShowXP(true);
        }
        
        // Hide confetti after 2 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 2000);
      }
    }
  });

  const { mutate: onDeleteTask } = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const handleCheckboxChange = (checked: boolean | string) => {
    // Get the position for XP animation from the checkbox ref
    if (checkboxRef.current) {
      const rect = checkboxRef.current.getBoundingClientRect();
      setXpPosition({ 
        x: rect.left + window.scrollX, 
        y: rect.top + window.scrollY 
      });
    }
    
    // Convert checked to boolean if it's a string
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

  return (
    <>
      <ConfettiEffect isActive={showConfetti} />
      
      {showXP && task.priority === 1 && (
        <FloatingXP 
          amount={20} 
          position={xpPosition} 
          onComplete={() => setShowXP(false)} 
        />
      )}
      
      <motion.div
        initial={task.is_completed ? { opacity: 0.8 } : { opacity: 1 }}
        animate={task.is_completed ? 
          { opacity: 0.7, x: 0 } : 
          { opacity: 1, x: 0 }
        }
        exit={{ opacity: 0, x: -10 }}
        layout
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`mb-2 ${task.is_completed ? 'bg-gray-50' : ''} ${energyClass}`}>
          <CardContent className="p-4 flex items-start">
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
              <div className="flex items-center mb-1">
                <span className={`text-sm font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </span>
                <span className="ml-2 text-sm">
                  {priorityEmojis[task.priority]}
                </span>
                {task.energy_level && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    task.energy_level === 'high' ? 'bg-energy-high/10 text-energy-high' : 
                    'bg-energy-low/10 text-energy-low'
                  }`}>
                    {task.energy_level === 'high' ? '⚡ High energy' : '🔋 Low energy'}
                  </span>
                )}
              </div>
              {task.description && (
                <p className={`text-sm text-gray-600 ${task.is_completed ? 'line-through' : ''}`}>
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 ml-2 flex">
              {!task.is_completed && task.energy_level === 'high' && (
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
                onClick={() => onEditTask(task)}
              >
                <Edit className="h-4 w-4" />
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
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
