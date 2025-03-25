import React from "react";
import { Task } from "@/types/tasks";
import { Draggable } from "react-beautiful-dnd";
import { TaskItem } from "./TaskItem";

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onEditTask: (task: Task) => void;
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  index,
  onEditTask
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1
          }}
          className={snapshot.isDragging ? "dragging" : ""}
        >
          <TaskItem task={task} onEditTask={onEditTask} />
        </div>
      )}
    </Draggable>
  );
}; 