
import React from "react";
import { Task, priorityColors, priorityEmojis } from "@/types/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { completeTask, deleteTask } from "@/services/taskService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TaskItemProps {
  task: Task;
  onEditTask: (task: Task) => void;
}

export function TaskItem({ task, onEditTask }: TaskItemProps) {
  const queryClient = useQueryClient();

  const { mutate: onToggleComplete } = useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => 
      completeTask(taskId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const { mutate: onDeleteTask } = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const handleToggleComplete = () => {
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
  );
}
