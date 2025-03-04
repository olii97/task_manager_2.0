
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/services/tasks";
import { useAuth } from "@/components/AuthProvider";
import { TaskItem } from "./TaskItem";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Today's Tasks
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onPlanTasks}
          >
            <Plus className="h-4 w-4 mr-1" /> Plan Tasks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {scheduledTasks.length === 0 ? (
          <div>
            <p className="mb-4 text-muted-foreground">
              You haven't planned any tasks for today yet.
            </p>
            <Button onClick={onPlanTasks}>
              <Plus className="h-4 w-4 mr-1" /> Plan Today's Tasks
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {highEnergyTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  ⚡ High Energy Tasks
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
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  🔋 Low Energy Tasks
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
      </CardContent>
    </Card>
  );
}
