import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Calendar, BookOpen, Menu } from "lucide-react";
import { QuickTaskInput } from "./QuickTaskInput";
import { Task } from "@/types/tasks";
import { WrapUpDayButton } from "./WrapUpDayButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TasksHeaderProps {
  onAddTask: () => void;
  onResetSchedule: () => void;
  onPlanTasks: () => void;
  onQuickTaskCreated: (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onWeeklyReflection?: () => void;
}

export function TasksHeader({ 
  onAddTask, 
  onResetSchedule, 
  onPlanTasks, 
  onQuickTaskCreated,
  onWeeklyReflection
}: TasksHeaderProps) {
  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2">
          <WrapUpDayButton />
          
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
        
        {/* Mobile dropdown menu - visible only on mobile */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                // Access the wrap up day functionality
                document.querySelector('.wrap-up-day-trigger')?.dispatchEvent(
                  new MouseEvent('click', { bubbles: true })
                );
              }}>
                Wrap up the day
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onResetSchedule}>
                Reset Schedule
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onPlanTasks}>
                Plan Today
              </DropdownMenuItem>
              
              {onWeeklyReflection && (
                <DropdownMenuItem onClick={onWeeklyReflection}>
                  Weekly Reflection
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={onAddTask}>
                Add Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Quick Task Input with AI */}
      <div className="w-full">
        <QuickTaskInput onTaskCreated={onQuickTaskCreated} />
      </div>
      
      {/* Mobile-only Add Task button below the search bar */}
      <div className="md:hidden flex justify-center mt-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={onAddTask} 
          className="w-full"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create New Task
        </Button>
      </div>
    </div>
  );
}
