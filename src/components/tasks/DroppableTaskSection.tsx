import React from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { DraggableTaskItem } from "./DraggableTaskItem";
import { Droppable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DroppableTaskSectionProps {
  droppableId: string;
  title: string;
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask: (task: Task) => void;
  icon?: React.ReactNode;
  emptyMessage?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  tooltip?: React.ReactNode;
  id?: string;
}

export function DroppableTaskSection({
  droppableId,
  title,
  tasks,
  onAddTask,
  onEditTask,
  icon,
  emptyMessage = "No tasks yet",
  collapsible = true,
  defaultOpen = false,
  className,
  tooltip,
  id,
}: DroppableTaskSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} id={id}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="text-lg font-semibold">{title}</h3>
              <span className="text-sm text-muted-foreground">({tasks.length})</span>
              
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        className="ml-1"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] p-3 text-xs">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {onAddTask && (
              <Button
              variant="outline"
                size="sm"
                onClick={onAddTask}
              className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Droppable droppableId={droppableId}>
          {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
              className="space-y-2"
          >
              {tasks.map((task, index) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={() => onEditTask(task)}
                />
              ))}
            {provided.placeholder}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {emptyMessage}
                </p>
              )}
          </div>
        )}
      </Droppable>
      </div>
    </div>
  );
} 