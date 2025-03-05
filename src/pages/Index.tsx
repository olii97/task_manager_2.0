
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
import { WeightHomeTile } from "@/components/weight/WeightHomeTile";
import { LogWeightModal } from "@/components/weight/LogWeightModal";
import { BodyFeelingModal } from "@/components/weight/BodyFeelingModal";
import { useJournalEntry } from "@/hooks/useJournalEntry";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useStravaActivities } from "@/hooks/useStravaActivities";
import { useWeightEntries } from "@/hooks/useWeightEntries";
import { useEffect } from "react";

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

  // Weight entries
  const {
    latestEntry,
    isLatestLoading,
    logModalOpen,
    setLogModalOpen,
    feelingModalOpen,
    setFeelingModalOpen,
    logWeight,
    recordBodyFeeling
  } = useWeightEntries(userId);

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
  }, [userId]);

  return (
    <div className="container py-6">
      {/* Weekly Intentions at the top */}
      <div className="mb-6">
        <WeeklyIntentionsCard />
      </div>
      
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
        />

        {/* Weight Tracker */}
        <WeightHomeTile
          latestEntry={latestEntry}
          isLoading={isLatestLoading}
          onLogWeight={() => setLogModalOpen(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Featured Goal */}
        <FeaturedGoal />

        {/* Strava Activities */}
        <StravaActivitiesCard 
          activities={stravaActivities || []} 
          isLoading={isStravaLoading} 
        />
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
      />

      {/* Weight Modals */}
      <LogWeightModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSave={logWeight}
      />

      <BodyFeelingModal
        open={feelingModalOpen}
        onClose={() => setFeelingModalOpen(false)}
        onSave={recordBodyFeeling}
      />
    </div>
  );
};

export default Index;
