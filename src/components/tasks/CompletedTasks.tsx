import React from "react";
import { Task } from "@/types/tasks";
import { TaskSection } from "./TaskSection";
import { Archive } from "lucide-react";
import { Project } from "@/types/projects";

interface CompletedTasksProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  limit?: number;
  projects?: Project[];
}

export function CompletedTasks({ tasks, onEditTask, limit = 10, projects = [] }: CompletedTasksProps) {
  const limitedTasks = limit ? tasks.slice(0, limit) : tasks;
  
  return (
    <TaskSection
      title="Previous Completed Tasks"
      tasks={limitedTasks}
      onEditTask={onEditTask}
      icon={<Archive className="h-5 w-5" />}
      collapsible={true}
      defaultOpen={false}
      emptyMessage="No previous completed tasks."
      className="opacity-90"
      projects={projects}
    />
  );
}
