
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TasksHeaderProps {
  onAddTask: () => void;
  onResetSchedule: () => void;
}

export function TasksHeader({ onAddTask, onResetSchedule }: TasksHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onResetSchedule}>
          <RefreshCw className="h-4 w-4 mr-1" /> Reset Schedule
        </Button>
        <Button onClick={onAddTask}>
          Add New Task
        </Button>
      </div>
    </div>
  );
}
