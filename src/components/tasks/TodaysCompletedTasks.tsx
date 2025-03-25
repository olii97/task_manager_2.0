import React from "react";
import { Task } from "@/types/tasks";
import { TaskSection } from "@/components/tasks/TaskSection";
import { CheckSquare } from "lucide-react";

interface TodaysCompletedTasksProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export function TodaysCompletedTasks({ tasks, onEditTask }: TodaysCompletedTasksProps) {
  // Filter tasks completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasksCompletedToday = tasks.filter(task => {
    if (!task.is_completed || !task.completion_date) return false;
    const completionDate = new Date(task.completion_date);
    return completionDate >= today;
  });
  
  return (
    <TaskSection
      title="Tasks Completed Today"
      tasks={tasksCompletedToday}
      onEditTask={onEditTask}
      icon={<CheckSquare className="h-5 w-5" />}
      emptyMessage="No tasks completed today yet."
      className="bg-green-50/50 border-green-100"
    />
  );
} 