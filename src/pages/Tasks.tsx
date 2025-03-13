
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Task } from "@/types/tasks";
import { 
  fetchTasks, 
  addTask, 
  updateTask, 
  resetDailySchedule 
} from "@/services/tasks";
import { TaskForm } from "@/components/tasks/TaskForm";
import { toast } from "@/hooks/use-toast";
import { TasksLoadingState } from "@/components/tasks/TasksLoadingState";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TodaysSections } from "@/components/tasks/TodaysSections";
import { TaskBacklog } from "@/components/tasks/TaskBacklog";
import { CompletedTasks } from "@/components/tasks/CompletedTasks";
import { TaskPlanner } from "@/components/tasks/TaskPlanner"; // Import TaskPlanner

const Tasks = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [plannerOpen, setPlannerOpen] = useState(false); // Add plannerOpen state

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
  });

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

  // Reset daily schedule mutation
  const { mutate: resetScheduleMutation } = useMutation({
    mutationFn: () => resetDailySchedule(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Schedule reset",
        description: "Your daily schedule has been reset.",
      });
    },
  });

  const handleAddTask = (taskData: Partial<Task>) => {
    addTaskMutation({
      title: taskData.title!,
      description: taskData.description,
      priority: taskData.priority as 1 | 2 | 3 | 4,
      is_completed: false,
      is_scheduled_today: false,
    });
  };

  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (!editingTask) return;
    updateTaskMutation({
      taskId: editingTask.id,
      updates: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
      },
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleResetSchedule = () => {
    if (window.confirm("Are you sure you want to reset your daily schedule? This will remove all tasks from today's schedule.")) {
      resetScheduleMutation();
    }
  };

  // Filter tasks into different sections
  const backlogTasks = tasks.filter(task => 
    !task.is_completed && !task.is_scheduled_today
  );
  
  const highEnergyTasks = tasks.filter(task => 
    !task.is_completed && task.is_scheduled_today && task.energy_level === 'high'
  );
  
  const lowEnergyTasks = tasks.filter(task => 
    !task.is_completed && task.is_scheduled_today && task.energy_level === 'low'
  );
  
  const completedTasks = tasks.filter(task => 
    task.is_completed
  );

  if (isLoading) {
    return <TasksLoadingState />;
  }

  return (
    <div className="container py-6">
      <TasksHeader 
        onAddTask={() => setTaskFormOpen(true)} 
        onResetSchedule={handleResetSchedule}
        onPlanTasks={() => setPlannerOpen(true)} // Add onPlanTasks handler
      />

      <TodaysSections 
        highEnergyTasks={highEnergyTasks} 
        lowEnergyTasks={lowEnergyTasks} 
        onEditTask={handleEditTask} 
      />

      <TaskBacklog 
        tasks={backlogTasks} 
        onAddTask={() => setTaskFormOpen(true)} 
        onEditTask={handleEditTask} 
      />

      <CompletedTasks 
        tasks={completedTasks} 
        onEditTask={handleEditTask} 
      />

      {/* Task Form Dialog */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(undefined);
        }}
        onSave={editingTask ? handleUpdateTask : handleAddTask}
        task={editingTask}
        title={editingTask ? "Edit Task" : "Add New Task"}
      />

      {/* Task Planner Dialog */}
      {plannerOpen && (
        <TaskPlanner
          open={plannerOpen}
          onClose={() => setPlannerOpen(false)}
          tasks={tasks}
          onAddTask={() => {
            setPlannerOpen(false);
            setTaskFormOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default Tasks;
