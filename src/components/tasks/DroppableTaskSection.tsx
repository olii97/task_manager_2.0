import React, { useState } from "react";
import { Task } from "@/types/tasks";
import { Droppable } from "react-beautiful-dnd";
import { DraggableTaskItem } from "./DraggableTaskItem";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Project } from "@/types/projects";

interface DroppableTaskSectionProps {
  droppableId: string;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask?: () => void;
  icon?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  projects?: Project[];
}

export function DroppableTaskSection({
  droppableId,
  title,
  tasks,
  onEditTask,
  onAddTask,
  icon,
  emptyMessage = "No tasks",
  className,
  collapsible = droppableId === "backlog", // Default to true for backlog
  defaultOpen = droppableId !== "backlog", // Default to closed for backlog
  projects = []
}: DroppableTaskSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Define the droppable content
  const droppableContent = (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "min-h-[100px] rounded-md transition-colors",
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
                  projects={projects}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[100px] items-center justify-center p-4 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  // If collapsible is true, render with collapsible wrapper
  if (collapsible) {
    return (
      <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
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
          <CollapsibleContent className="pt-2">{droppableContent}</CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Otherwise, render the non-collapsible version
  return (
    <div className={`bg-card rounded-lg border p-4 h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
          <span className="ml-2 text-sm text-muted-foreground">({tasks.length})</span>
        </h2>
        {onAddTask && (
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-grow ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            } rounded-lg transition-colors duration-200 min-h-[100px] overflow-y-auto max-h-[calc(100vh-350px)]`}
          >
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              tasks.map((task, index) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onEditTask={onEditTask}
                  projects={projects}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
} 