import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Task } from "@/types/tasks";
import { 
  fetchTasks, 
  addTask, 
  updateTask, 
  resetDailySchedule,
  scheduleTaskForToday
} from "@/services/tasks";
import { TaskForm } from "@/components/tasks/TaskForm";
import { toast } from "@/hooks/use-toast";
import { TasksLoadingState } from "@/components/tasks/TasksLoadingState";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TodaysSections } from "@/components/tasks/TodaysSections";
import { TaskBacklog } from "@/components/tasks/TaskBacklog";
import { CompletedTasks } from "@/components/tasks/CompletedTasks";
import { TodaysCompletedTasks } from "@/components/tasks/TodaysCompletedTasks";
import { TaskPlanner } from "@/components/tasks/TaskPlanner";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { DroppableTaskSection } from "@/components/tasks/DroppableTaskSection";
import { Zap, Battery, ClipboardList } from "lucide-react";

const Tasks = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
  });

  const { mutate: addTaskMutation } = useMutation({
    mutationFn: (newTask: Omit<Task, "id" | "created_at" | "updated_at">) => 
      addTask(userId!, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTaskFormOpen(false);
    },
  });

  const { mutate: updateTaskMutation } = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => 
      updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTaskFormOpen(false);
      setEditingTask(undefined);
    },
  });

  const { mutate: scheduleTaskMutation } = useMutation({
    mutationFn: ({ taskId, isScheduled, energyLevel }: { taskId: string; isScheduled: boolean; energyLevel?: 'high' | 'low' }) => 
      scheduleTaskForToday(taskId, isScheduled, energyLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

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
      energy_level: taskData.energy_level as 'high' | 'low' | undefined,
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
        energy_level: taskData.energy_level,
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

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside a valid drop target
    if (!destination) return;
    
    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Handle the various drag scenarios
    const taskId = result.draggableId;
    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Define what happens for each drag scenario
    if (sourceId === 'backlog') {
      if (destinationId === 'high-energy') {
        // Move from backlog to high energy
        scheduleTaskMutation({
          taskId: taskId,
          isScheduled: true,
          energyLevel: 'high'
        });
        toast({
          title: "Task scheduled",
          description: "Task added to high energy tasks for today",
        });
      } else if (destinationId === 'low-energy') {
        // Move from backlog to low energy
        scheduleTaskMutation({
          taskId: taskId,
          isScheduled: true,
          energyLevel: 'low'
        });
        toast({
          title: "Task scheduled",
          description: "Task added to low energy tasks for today",
        });
      }
    } else if (sourceId === 'high-energy') {
      if (destinationId === 'backlog') {
        // Move from high energy to backlog
        scheduleTaskMutation({
          taskId: taskId,
          isScheduled: false
        });
        toast({
          title: "Task unscheduled",
          description: "Task removed from today's schedule",
        });
      } else if (destinationId === 'low-energy') {
        // Move from high energy to low energy
        scheduleTaskMutation({
          taskId: taskId,
          isScheduled: true,
          energyLevel: 'low'
        });
        toast({
          title: "Task updated",
          description: "Task moved to low energy tasks",
        });
      }
    } else if (sourceId === 'low-energy') {
      if (destinationId === 'backlog') {
        // Move from low energy to backlog
        scheduleTaskMutation({
          taskId: taskId,
          isScheduled: false
        });
        toast({
          title: "Task unscheduled",
          description: "Task removed from today's schedule",
        });
      } else if (destinationId === 'high-energy') {
        // Move from low energy to high energy
        scheduleTaskMutation({
          taskId: taskId,
          isScheduled: true,
          energyLevel: 'high'
        });
        toast({
          title: "Task updated",
          description: "Task moved to high energy tasks",
        });
      }
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

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter out tasks completed before today for the "Previously Completed Tasks" section
  const previouslyCompletedTasks = completedTasks.filter(task => {
    if (!task.completion_date) return true; // Include tasks with no completion date
    const completionDate = new Date(task.completion_date);
    return completionDate < today;
  });

  if (isLoading) {
    return <TasksLoadingState />;
  }

  return (
    <div className="container py-6">
      <TasksHeader 
        onAddTask={() => setTaskFormOpen(true)} 
        onResetSchedule={handleResetSchedule}
        onPlanTasks={() => setPlannerOpen(true)}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* High Energy Tasks */}
          <DroppableTaskSection
            droppableId="high-energy"
            title="Today's High Energy Tasks"
            tasks={highEnergyTasks}
            onEditTask={handleEditTask}
            icon={<Zap className="h-5 w-5 text-energy-high" />}
            emptyMessage="Drag tasks here or use the Plan Today button."
            className="border-energy-high/20"
          />

          {/* Low Energy Tasks */}
          <DroppableTaskSection
            droppableId="low-energy"
            title="Today's Low Energy Tasks"
            tasks={lowEnergyTasks}
            onEditTask={handleEditTask}
            icon={<Battery className="h-5 w-5 text-energy-low" />}
            emptyMessage="Drag tasks here or use the Plan Today button."
            className="border-energy-low/20"
          />

          {/* Backlog */}
          <DroppableTaskSection
            droppableId="backlog"
            title="Backlog"
            tasks={backlogTasks}
            onAddTask={() => setTaskFormOpen(true)}
            onEditTask={handleEditTask}
            icon={<ClipboardList className="h-5 w-5" />}
            emptyMessage="Your backlog is empty. Add some tasks!"
          />
        </div>
      </DragDropContext>

      <TodaysCompletedTasks
        tasks={completedTasks}
        onEditTask={handleEditTask}
      />

      {previouslyCompletedTasks.length > 0 && (
        <CompletedTasks 
          tasks={previouslyCompletedTasks} 
          onEditTask={handleEditTask} 
          limit={10}
        />
      )}

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
