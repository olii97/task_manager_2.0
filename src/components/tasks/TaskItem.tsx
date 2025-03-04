
import React, { useState } from "react";
import { Task, priorityColors, priorityEmojis } from "@/types/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { completeTask, deleteTask } from "@/services/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";
import { FloatingXP } from "@/components/animations/FloatingXP";

interface TaskItemProps {
  task: Task;
  onEditTask: (task: Task) => void;
}

export function TaskItem({ task, onEditTask }: TaskItemProps) {
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpPosition, setXpPosition] = useState({ x: 0, y: 0 });

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

  const handleToggleComplete = (event: React.MouseEvent) => {
    // Get position for XP animation
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setXpPosition({ 
      x: rect.left + window.scrollX, 
      y: rect.top + window.scrollY 
    });
    
    onToggleComplete({
      taskId: task.id,
      isCompleted: !task.is_completed
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDeleteTask(task.id);
    }
  };

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
      >
        <Card className={`mb-2 ${task.is_completed ? 'bg-gray-50' : ''}`}>
          <CardContent className="p-4 flex items-start">
            <div className="flex-shrink-0 mr-3 mt-1">
              <Checkbox 
                checked={task.is_completed} 
                onCheckedChange={handleToggleComplete}
                aria-label={task.is_completed ? "Mark as incomplete" : "Mark as complete"}
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
                  <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full">
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
            <div className="flex-shrink-0 ml-2">
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
