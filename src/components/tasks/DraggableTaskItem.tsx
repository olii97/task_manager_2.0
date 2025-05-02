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
          style={{
            ...provided.draggableProps.style,
            // Remove default browser drag preview
            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : "translate(0, 0)",
          }}
          className={cn(
            "transition-shadow",
            snapshot.isDragging && "shadow-lg rounded-lg"
          )}
        >
          <TaskItem task={task} onEdit={onEdit} />
        </div>
      )}
    </Draggable>
  );
} 