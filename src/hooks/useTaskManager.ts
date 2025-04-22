import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types/tasks";
import { addTask, updateTask } from "@/services/tasks";

export const useTaskManager = (userId: string | undefined) => {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const queryClient = useQueryClient();

  // Add task mutation
  const { mutate: addTaskMutation } = useMutation({
    mutationFn: (newTask: Omit<Task, "id" | "created_at" | "updated_at">) => 
      addTask(userId!, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTaskFormOpen(false);
    },
  });

  // Update task mutation
  const { mutate: updateTaskMutation } = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => 
      updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTaskFormOpen(false);
      setEditingTask(undefined);
    },
  });

  const handleAddTask = (taskData: Partial<Task>) => {
    addTaskMutation({
      title: taskData.title!,
      description: taskData.description,
      priority: taskData.priority as 1 | 2 | 3 | 4,
      energy_level: taskData.energy_level as 'high' | 'low' | undefined,
      category: taskData.category,
      is_completed: false,
      is_scheduled_today: false,
      user_id: userId!,
      task_type: taskData.task_type || 'personal',
      project_id: taskData.project_id,
      due_date: taskData.due_date,
    });
  };

  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (!editingTask) return;
    console.log('Updating task with data:', taskData);
    updateTaskMutation({
      taskId: editingTask.id,
      updates: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        energy_level: taskData.energy_level,
        category: taskData.category,
        project_id: taskData.project_id,
        due_date: taskData.due_date,
        task_type: taskData.task_type,
      },
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  return {
    taskFormOpen,
    setTaskFormOpen,
    plannerOpen,
    setPlannerOpen,
    editingTask,
    setEditingTask,
    handleAddTask,
    handleUpdateTask,
    handleEditTask
  };
};
