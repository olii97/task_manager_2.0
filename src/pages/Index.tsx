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
import { WeightTrackerCard } from "@/components/home/WeightTrackerCard";
import { useJournalEntry } from "@/hooks/useJournalEntry";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useStravaActivities } from "@/hooks/useStravaActivities";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LayoutGrid } from "lucide-react";
import ChatBot from "@/components/chat/ChatBot";
import { useToast } from "@/components/ui/use-toast";
import { DashboardCard } from "@/components/home/DashboardCard";

const Index = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { toast } = useToast();
  const { resetSettings } = useDashboardSettings();

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

  const handleResetDashboard = () => {
    resetSettings();
    toast({
      title: "Dashboard reset",
      description: "All hidden tiles have been restored.",
    });
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleResetDashboard}>
          <LayoutGrid className="h-4 w-4 mr-1" />
          Reset Layout
        </Button>
      </div>

      {/* Main content area - tasks, journal, and weight tracker side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

        {/* Weight Tracker */}
        {userId && (
          <WeightTrackerCard userId={userId} />
        )}
      </div>
      
      {/* Featured Goal and Weekly Intentions row - moved below tasks and journal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="h-[200px] overflow-auto">
          <FeaturedGoal />
        </div>
        <div className="h-[200px] overflow-auto">
          <WeeklyIntentionsCard />
        </div>
      </div>

      {/* Chat Bot below tasks and journal */}
      <div className="mb-6">
        <ChatBot />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strava Activities */}
        <StravaActivitiesCard 
          activities={stravaActivities || []} 
          isLoading={isStravaLoading} 
        />
        
        {/* Wrap Up Day Section */}
        <DashboardCard id="daily-summary" title="Daily Summary">
          <p className="text-muted-foreground mb-4">
            Download a summary of your day including journal entries, completed tasks, and workout activities.
          </p>
          <WrapUpDayButton userId={userId} />
        </DashboardCard>
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

      {/* Task Planner Dialog */}
      <TaskPlanner
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        tasks={tasks}
        onAddTask={() => setTaskFormOpen(true)}
      />
    </div>
  );
};

export default Index;
