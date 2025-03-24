import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/services/tasks";
import { useAuth } from "@/components/AuthProvider";
import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Timer, Flame, Waves, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Card, CardContent } from "@/components/ui/card";

interface TodaysTasksProps {
  onEditTask: (task: any) => void;
  onPlanTasks: () => void;
}

export function TodaysTasks({ onEditTask, onPlanTasks }: TodaysTasksProps) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
  });

  const scheduledTasks = tasks.filter(
    (task) => !task.is_completed && task.is_scheduled_today
  );

  const highEnergyTasks = scheduledTasks.filter(
    (task) => task.energy_level === "high"
  );

  const lowEnergyTasks = scheduledTasks.filter(
    (task) => task.energy_level === "low"
  );

  const handleStartMeditation = () => {
    alert("Meditation feature coming soon!");
  };

  if (isLoading) {
    return (
      <DashboardCard id="todays-tasks" title="Today's Tasks">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </DashboardCard>
    );
  }

  const rightContent = (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleStartMeditation}
        className="bg-meditation-primary/10 border-meditation-primary/30 text-meditation-primary hover:bg-meditation-primary/20"
      >
        <Moon className="h-4 w-4 mr-1" /> Meditate
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onPlanTasks}
      >
        <Plus className="h-4 w-4 mr-1" /> Plan Tasks
      </Button>
    </div>
  );

  return (
    <DashboardCard 
      id="todays-tasks" 
      title="Today's Tasks" 
      titleRightContent={rightContent}
      className="border-primary/20"
    >
      {scheduledTasks.length === 0 ? (
        <div>
          <p className="mb-4 text-muted-foreground">
            You haven't planned any tasks for today yet.
          </p>
          <Button onClick={onPlanTasks} glow>
            <Plus className="h-4 w-4 mr-1" /> Plan Today's Tasks
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {highEnergyTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-energy-high mb-2 flex items-center">
                <Flame className="h-4 w-4 mr-1" /> High Energy Tasks
              </h3>
              <div className="space-y-2">
                {highEnergyTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEditTask={onEditTask}
                  />
                ))}
              </div>
            </div>
          )}

          {lowEnergyTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-energy-low mb-2 flex items-center">
                <Waves className="h-4 w-4 mr-1" /> Low Energy Tasks
              </h3>
              <div className="space-y-2">
                {lowEnergyTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEditTask={onEditTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="text-right mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/tasks">View All Tasks</Link>
            </Button>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
