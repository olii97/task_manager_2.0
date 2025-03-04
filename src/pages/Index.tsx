import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { JournalStreak } from "@/components/JournalStreak";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseEntryToJournalEntry, getMoodEmoji } from "@/types/journal";
import { format } from "date-fns";
import { FeaturedGoal } from "@/components/FeaturedGoal";
import { PenLine, Plus } from "lucide-react";
import { WeeklyIntentionsCard } from "@/components/WeeklyIntentionsCard";
import { StravaActivityList } from "@/components/StravaActivityList";
import { fetchStravaActivities } from "@/services/stravaService";
import { TodaysTasks } from "@/components/tasks/TodaysTasks";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskPlanner } from "@/components/tasks/TaskPlanner";
import { fetchTasks, addTask, updateTask } from "@/services/tasks";
import { useState } from "react";
import { Task } from "@/types/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const today = format(new Date(), "yyyy-MM-dd");
  const queryClient = useQueryClient();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Fetch today's journal entry
  const { data: todayEntry, isLoading: isJournalLoading } = useQuery({
    queryKey: ["journal-entry", today],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching journal entry:", error);
        throw error;
      }
      
      return data ? mapDatabaseEntryToJournalEntry(data) : null;
    },
    enabled: !!userId,
  });

  // Fetch recent Strava activities
  const { data: stravaActivities, isLoading: isStravaLoading } = useQuery({
    queryKey: ["strava-activities", userId, "recent"],
    queryFn: async () => {
      if (!userId) return [];
      const { activities, error } = await fetchStravaActivities(userId);
      if (error) {
        console.error("Error fetching Strava activities:", error);
        return [];
      }
      return activities.slice(0, 5); // Get only the 5 most recent activities
    },
    enabled: !!userId,
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
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

        {/* Today's Journal Entry or Add Button */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Journal</CardTitle>
          </CardHeader>
          <CardContent>
            {isJournalLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded-md"></div>
            ) : todayEntry ? (
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{todayEntry.mood ? getMoodEmoji(todayEntry.mood) : "😐"}</span>
                  <p className="text-sm text-muted-foreground">
                    Mood: {todayEntry.mood}/5 • Energy: {todayEntry.energy}/5
                  </p>
                </div>
                {todayEntry.reflection && (
                  <p className="text-sm line-clamp-3 mt-2">{todayEntry.reflection}</p>
                )}
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/journal">
                      <PenLine className="h-4 w-4 mr-1" /> View Full Entry
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-muted-foreground">You haven't journaled today yet.</p>
                <Button asChild>
                  <Link to="/journal">
                    <Plus className="h-4 w-4 mr-1" /> Add Journal Entry
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Goal */}
        <FeaturedGoal />
      </div>

      {/* Strava Activities */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Strava Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <StravaActivityList 
              activities={stravaActivities || []} 
              isLoading={isStravaLoading}
              compact={true}
            />
            {stravaActivities && stravaActivities.length > 0 && (
              <div className="mt-4 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link to="/strava">View All Activities</Link>
                </Button>
              </div>
            )}
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

      {/* Task Planner Dialog */}
      <TaskPlanner
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        tasks={tasks}
      />
    </div>
  );
};

export default Index;
