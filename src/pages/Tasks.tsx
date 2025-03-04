
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Task } from "@/types/tasks";
import { 
  fetchTasks, 
  addTask, 
  updateTask, 
  resetDailySchedule 
} from "@/services/taskService";
import { TaskSection } from "@/components/tasks/TaskSection";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  ClipboardCheck, 
  ClipboardList, 
  Zap, 
  Battery, 
  CheckCheck, 
  RefreshCw 
} from "lucide-react";

const Tasks = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

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
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Tasks</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleResetSchedule}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reset Schedule
          </Button>
          <Button onClick={() => setTaskFormOpen(true)}>
            Add New Task
          </Button>
        </div>
      </div>

      {/* Today's High Energy Tasks */}
      <TaskSection
        title="Today's High Energy Tasks"
        tasks={highEnergyTasks}
        onEditTask={handleEditTask}
        icon={<Zap className="h-5 w-5" />}
        emptyMessage="No high energy tasks scheduled for today."
      />

      {/* Today's Low Energy Tasks */}
      <TaskSection
        title="Today's Low Energy Tasks"
        tasks={lowEnergyTasks}
        onEditTask={handleEditTask}
        icon={<Battery className="h-5 w-5" />}
        emptyMessage="No low energy tasks scheduled for today."
      />

      {/* Backlog */}
      <TaskSection
        title="Backlog"
        tasks={backlogTasks}
        onAddTask={() => setTaskFormOpen(true)}
        onEditTask={handleEditTask}
        icon={<ClipboardList className="h-5 w-5" />}
        emptyMessage="Your backlog is empty. Add some tasks!"
      />

      {/* Completed Tasks */}
      <TaskSection
        title="Completed Tasks"
        tasks={completedTasks.slice(0, 10)} // Show only the 10 most recent completed tasks
        onEditTask={handleEditTask}
        icon={<CheckCheck className="h-5 w-5" />}
        collapsible={true}
        defaultOpen={false}
        emptyMessage="No completed tasks yet."
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
    </div>
  );
};

export default Tasks;
