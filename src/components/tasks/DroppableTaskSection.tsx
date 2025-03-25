import React, { ReactNode } from "react";
import { Task } from "@/types/tasks";
import { Droppable } from "react-beautiful-dnd";
import { DraggableTaskItem } from "./DraggableTaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DroppableTaskSectionProps {
  droppableId: string;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask?: () => void;
  icon?: ReactNode;
  emptyMessage?: string;
  className?: string;
}

export const DroppableTaskSection: React.FC<DroppableTaskSectionProps> = ({
  droppableId,
  title,
  tasks,
  onEditTask,
  onAddTask,
  icon,
  emptyMessage = "No tasks",
  className
}) => {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">({tasks.length})</span>
        </div>
        {onAddTask && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTask}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add task</span>
          </Button>
        )}
      </div>

      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[200px] rounded-md transition-colors",
              snapshot.isDraggingOver 
                ? "bg-accent/50" 
                : "bg-muted/50"
            )}
          >
            {tasks.length > 0 ? (
              <div className="flex flex-col gap-2 p-2">
                {tasks.map((task, index) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onEditTask={onEditTask}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center p-4 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}; 