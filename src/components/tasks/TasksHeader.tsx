import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Calendar, BookOpen } from "lucide-react";
import { QuickTaskInput } from "./QuickTaskInput";
import { Task } from "@/types/tasks";
import { Project } from "@/types/projects";

interface TasksHeaderProps {
  onAddTask: () => void;
  onResetSchedule: () => void;
  onPlanTasks: () => void;
  onQuickTaskCreated: (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onWeeklyReflection?: () => void;
  projects?: Project[];
}

export function TasksHeader({ 
  onAddTask, 
  onResetSchedule, 
  onPlanTasks, 
  onQuickTaskCreated,
  onWeeklyReflection,
  projects = []
}: TasksHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center space-x-2">
          {onWeeklyReflection && (
            <Button
              variant="outline"
              size="sm"
              onClick={onWeeklyReflection}
              className="flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Weekly Reflection
            </Button>
          )}
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
      
      {/* Quick Task Input with AI */}
      <div className="w-full">
        <QuickTaskInput 
          onTaskCreated={onQuickTaskCreated} 
          projects={projects}
        />
      </div>
    </div>
  );
}
