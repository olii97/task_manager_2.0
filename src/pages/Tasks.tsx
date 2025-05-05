import React, { useState, useEffect } from "react";
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
import { Zap, Battery, ClipboardList, Timer } from "lucide-react";
import { WeeklyTaskReflection } from "@/components/tasks/WeeklyTaskReflection";
import { shouldShowWeeklyReflection, getWeeklyCompletedTasks } from "@/services/tasks/taskReflectionService";
import { Separator } from '@/components/ui/separator';
import { usePomodoro } from "@/components/pomodoro/PomodoroProvider";
import { getPomodoroStats } from "@/services/pomodoroService";
import { TaskTicker } from "@/components/tasks/TaskTicker";

const Tasks = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const { completedCount } = usePomodoro();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [showWeeklyReflection, setShowWeeklyReflection] = useState(false);
  const [weeklyCompletedTasks, setWeeklyCompletedTasks] = useState<Task[]>([]);

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
      user_id: userId!,
      category: taskData.category,
      due_date: taskData.due_date,
      task_type: taskData.task_type || 'personal',
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
        due_date: taskData.due_date,
        task_type: taskData.task_type,
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

  const handleQuickTaskCreated = (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    addTaskMutation(taskData);
  };

  useEffect(() => {
    const checkWeeklyReflection = async () => {
      if (session?.user.id) {
        const shouldShow = await shouldShowWeeklyReflection(session.user.id);
        if (shouldShow) {
          const tasks = await getWeeklyCompletedTasks(session.user.id);
          setWeeklyCompletedTasks(tasks);
          setShowWeeklyReflection(true);
        }
      }
    };
    checkWeeklyReflection();
  }, [session?.user.id]);

  const handleWeeklyReflection = async () => {
    if (session?.user.id) {
      const tasks = await getWeeklyCompletedTasks(session.user.id);
      setWeeklyCompletedTasks(tasks);
      setShowWeeklyReflection(true);
    }
  };

  if (isLoading) {
    return <TasksLoadingState />;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <TasksHeader 
          onAddTask={() => setTaskFormOpen(true)} 
          onResetSchedule={handleResetSchedule}
          onPlanTasks={() => setPlannerOpen(true)}
          onQuickTaskCreated={handleQuickTaskCreated}
        />
      </div>

      {/* Daily Tasks Section */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daily Tasks</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>{completedCount} Pomodoros Today</span>
          </div>
        </div>
        <Separator className="mb-4" />
        
        {/* Temporarily hiding TaskTicker
        <TaskTicker className="mb-6" />
        */}
      </div>

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
            tooltip={
              <>
                <p className="font-semibold mb-1">High Energy Tasks</p>
                <p className="mb-1">Tasks that require significant mental focus, attention, and energy. Best completed during your peak energy hours.</p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="font-semibold mb-1">Pomodoro Timer</p>
                  <p className="mb-1">For focused work:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Click the ▶️ button on any task</li>
                    <li>Work in 25-minute focused sessions</li>
                    <li>Take 5-minute breaks between sessions</li>
                    <li>Complete 4 sessions to earn rewards</li>
                  </ul>
                </div>
              </>
            }
            id="high-energy-section"
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
            tooltip={
              <>
                <p className="font-semibold mb-1">Low Energy Tasks</p>
                <p>Tasks that require less mental effort and can be completed during lower energy periods of your day. Good for afternoons or when you need a break from high-intensity work.</p>
              </>
            }
            id="low-energy-section"
          />

          {/* Backlog */}
          <DroppableTaskSection
            droppableId="backlog"
            title="Backlog"
            tasks={backlogTasks}
            onAddTask={() => setTaskFormOpen(true)}
            onEditTask={handleEditTask}
            icon={<ClipboardList className="h-5 w-5 text-slate-500" />}
            emptyMessage="Your backlog is empty. Add some tasks!"
            collapsible={false}
            defaultOpen={true}
            tooltip={
              <>
                <p className="font-semibold mb-1">Backlog</p>
                <p className="mb-1">Your collection of tasks that need to be completed but aren't scheduled for today.</p>
                <p>To plan your day:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Drag tasks from backlog to High or Low Energy sections</li>
                  <li>Or use the "Plan Today" button to organize multiple tasks at once</li>
                </ul>
              </>
            }
            id="backlog-section"
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

      <WeeklyTaskReflection
        open={showWeeklyReflection}
        onClose={() => setShowWeeklyReflection(false)}
        completedTasks={weeklyCompletedTasks}
      />
    </div>
  );
};

export default Tasks;
