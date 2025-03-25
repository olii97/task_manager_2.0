import React from "react";
import { Task } from "@/types/tasks";
import { TaskSection } from "./TaskSection";
import { CheckSquare } from "lucide-react";
import { Project } from "@/types/projects";

interface TodaysCompletedTasksProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  projects?: Project[];
}

export function TodaysCompletedTasks({ tasks, onEditTask, projects = [] }: TodaysCompletedTasksProps) {
  // Filter only tasks completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysCompletedTasks = tasks.filter(task => {
    if (!task.completion_date) return false;
    const completionDate = new Date(task.completion_date);
    return completionDate >= today;
  });
  
  if (todaysCompletedTasks.length === 0) {
    return null;
  }
  
  return (
    <TaskSection
      title="Completed Today"
      tasks={todaysCompletedTasks}
      onEditTask={onEditTask}
      icon={<CheckSquare className="h-5 w-5 text-green-500" />}
      collapsible={true}
      defaultOpen={true}
      emptyMessage="No tasks completed today."
      projects={projects}
    />
  );
} 