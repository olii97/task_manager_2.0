import React from "react";
import { Task } from "@/types/tasks";
import { TaskSection } from "@/components/tasks/TaskSection";
import { CheckCheck } from "lucide-react";

interface CompletedTasksProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  limit?: number;
}

export function CompletedTasks({ tasks, onEditTask, limit = 10 }: CompletedTasksProps) {
  const limitedTasks = tasks.slice(0, limit);
  
  return (
    <TaskSection
      title="Previously Completed Tasks"
      tasks={limitedTasks}
      onEditTask={onEditTask}
      icon={<CheckCheck className="h-5 w-5" />}
      collapsible={true}
      defaultOpen={false}
      emptyMessage="No previously completed tasks found."
    />
  );
}
