import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { TaskItem } from "./TaskItem";
import { Task } from "@/types/tasks";
import { Project } from "@/types/projects";

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onEditTask: (task: Task) => void;
  projects?: Project[];
}

export function DraggableTaskItem({ task, index, onEditTask, projects = [] }: DraggableTaskItemProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <TaskItem task={task} onEditTask={onEditTask} projects={projects} />
        </div>
      )}
    </Draggable>
  );
} 