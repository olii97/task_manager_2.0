
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { JournalStreak } from "@/components/JournalStreak";
import { fetchTasks } from "@/services/tasks";
import { FeaturedGoal } from "@/components/FeaturedGoal";
import { WeeklyIntentionsCard } from "@/components/WeeklyIntentionsCard";
import { TodaysTasks } from "@/components/tasks/TodaysTasks";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskPlanner } from "@/components/tasks/TaskPlanner";
import { TodaysJournalCard } from "@/components/home/TodaysJournalCard";
import { StravaActivitiesCard } from "@/components/home/StravaActivitiesCard";
import { WrapUpDayButton } from "@/components/home/WrapUpDayButton";
import { useJournalEntry } from "@/hooks/useJournalEntry";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useStravaActivities } from "@/hooks/useStravaActivities";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBot from "@/components/chat/ChatBot";

const Index = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  // Journal entry data
  const { todayEntry, isLoading: isJournalLoading, refreshTodayEntry } = useJournalEntry(userId);

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

  // Strava activities
  const { stravaActivities, isLoading: isStravaLoading } = useStravaActivities(userId);

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
  });

  // Refresh journal entry when component mounts
  useEffect(() => {
    if (userId) {
      refreshTodayEntry();
    }
  }, [userId, refreshTodayEntry]);

  // Function to open the task form - this matches the expected signature for onAddTask
  const openTaskForm = () => {
    setTaskFormOpen(true);
  };

  return (
    <div className="container py-6">
      {/* Top row with Featured Goal and Weekly Intentions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FeaturedGoal />
        <WeeklyIntentionsCard />
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <TodaysTasks 
          onEditTask={handleEditTask} 
          onPlanTasks={() => setPlannerOpen(true)} 
        />

        {/* Today's Journal Entry */}
        <TodaysJournalCard 
          entry={todayEntry} 
          isLoading={isJournalLoading}
          refreshTodayEntry={refreshTodayEntry}
        />

        {/* Featured Goal */}
        <ChatBot />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Strava Activities */}
        <StravaActivitiesCard 
          activities={stravaActivities || []} 
          isLoading={isStravaLoading} 
        />
        
        {/* Wrap Up Day Section */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Download a summary of your day including journal entries, completed tasks, and workout activities.
            </p>
            <WrapUpDayButton userId={userId} />
          </CardContent>
        </Card>
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
      />

      {/* Task Planner Dialog - Using openTaskForm for onAddTask which matches the expected signature */}
      <TaskPlanner
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        tasks={tasks}
        onAddTask={openTaskForm}
      />
    </div>
  );
};

export default Index;
