
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Calendar } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  onResetSchedule: () => void;
  onPlanTasks: () => void; // Add onPlanTasks prop
}

export function TasksHeader({ onAddTask, onResetSchedule, onPlanTasks }: TasksHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
      <h1 className="text-2xl font-bold mb-2 sm:mb-0">Tasks</h1>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetSchedule}
          className="text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Reset Schedule
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPlanTasks}
          className="text-xs"
        >
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Plan Today
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onAddTask}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
