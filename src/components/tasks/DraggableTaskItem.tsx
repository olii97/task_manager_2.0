import React from "react";
import { Task } from "@/types/tasks";
import { Draggable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import { TaskItem } from "./TaskItem";

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onEdit: () => void;
}

export function DraggableTaskItem({ task, index, onEdit }: DraggableTaskItemProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-lg border bg-card p-3",
            snapshot.isDragging && "shadow-lg"
          )}
        >
          <TaskItem task={task} onEdit={onEdit} />
        </div>
      )}
    </Draggable>
  );
} 