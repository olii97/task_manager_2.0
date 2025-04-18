import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/services/tasks";
import { TodaysTasks } from "@/components/tasks/TodaysTasks";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskPlanner } from "@/components/tasks/TaskPlanner";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchProjects } from "@/services/projects/projectService";
import { fetchCalendarEntries } from "@/services/calendar/calendarService";
import { VerticalCalendarWidget } from "@/components/calendar/VerticalCalendarWidget";
import { addDays } from "date-fns";

const Index = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  // Task management
  const {
    taskFormOpen,
    setTaskFormOpen,
    plannerOpen,
    setPlannerOpen,
    editingTask,
    setEditingTask,
    handleAddTask,
    handleUpdateTask,
    handleEditTask
  } = useTaskManager(userId);

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => fetchProjects(userId!),
    enabled: !!userId,
  });

  // Fetch calendar entries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendarEndDate = addDays(today, 14);
  
  const { data: calendarEntries = [], isLoading: isCalendarLoading } = useQuery({
    queryKey: ["calendar", userId, today, calendarEndDate],
    queryFn: () => fetchCalendarEntries(userId!, today, calendarEndDate),
    enabled: !!userId,
  });

  return (
    <div className="container py-6">
      {/* Main content area - tasks and calendar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Tasks */}
        <TodaysTasks 
          onEditTask={handleEditTask} 
          onPlanTasks={() => setPlannerOpen(true)} 
        />

        {/* Calendar Widget */}
        {userId && (
          <VerticalCalendarWidget
            entries={calendarEntries}
            userId={userId}
            daysToShow={7}
            isLoading={isCalendarLoading}
          />
        )}
      </div>

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
        projects={projects}
      />

      {/* Task Planner Dialog */}
      <TaskPlanner
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        tasks={tasks}
        onAddTask={() => setTaskFormOpen(true)}
        projects={projects}
      />
    </div>
  );
};

export default Index;
