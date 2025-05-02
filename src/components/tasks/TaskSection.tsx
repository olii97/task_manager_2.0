import React from "react";
import { Task } from "@/types/tasks";
import { TaskItem } from "./TaskItem";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown } from "lucide-react";

interface TaskSectionProps {
  title: string | React.ReactNode;
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask: (task: Task) => void;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function TaskSection({ 
  title, 
  tasks, 
  onAddTask, 
  onEditTask, 
  icon, 
  collapsible = false, 
  defaultOpen = true,
  emptyMessage = "No tasks found.",
  className = "",
}: TaskSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (collapsible) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={`mb-6 ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <h2 className="text-lg font-semibold flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
              <span className="ml-2 text-sm text-muted-foreground">({tasks.length})</span>
            </h2>
          </div>
          {onAddTask && (
            <Button onClick={onAddTask} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          )}
        </div>
        <CollapsibleContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
              />
            ))
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
          <span className="ml-2 text-sm text-muted-foreground">({tasks.length})</span>
        </h2>
        {onAddTask && (
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
          />
        ))
      )}
    </div>
  );
}
