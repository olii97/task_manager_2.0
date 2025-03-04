
import React from "react";
import { Task } from "@/types/tasks";
import { TaskSection } from "@/components/tasks/TaskSection";
import { ClipboardList } from "lucide-react";

interface TaskBacklogProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function TaskBacklog({ tasks, onAddTask, onEditTask }: TaskBacklogProps) {
  return (
    <TaskSection
      title="Backlog"
      tasks={tasks}
      onAddTask={onAddTask}
      onEditTask={onEditTask}
      icon={<ClipboardList className="h-5 w-5" />}
      emptyMessage="Your backlog is empty. Add some tasks!"
    />
  );
}
