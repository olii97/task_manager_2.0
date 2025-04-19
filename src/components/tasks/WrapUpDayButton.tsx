import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoonStar } from "lucide-react";
import { DaySummary } from "./DaySummary";
import { Task } from "@/types/tasks";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/services/tasks";
import { useAuth } from "@/components/AuthProvider";

export function WrapUpDayButton() {
  const [showDaySummary, setShowDaySummary] = useState(false);
  const { session } = useAuth();
  
  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Fetch all tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => session?.user ? fetchTasks(session.user.id) : Promise.resolve([]),
    enabled: !!session?.user,
  });
  
  // Filter for tasks completed today
  const completedTodayTasks = tasks.filter((task: Task) => {
    if (!task.is_completed || !task.completion_date) return false;
    const completionDate = new Date(task.completion_date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime();
  });
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 border-slate-700"
        onClick={() => setShowDaySummary(true)}
      >
        <MoonStar className="h-4 w-4" />
        <span>Wrap up the day</span>
      </Button>
      
      <DaySummary
        open={showDaySummary}
        onClose={() => setShowDaySummary(false)}
        completedTasks={completedTodayTasks}
      />
    </>
  );
} 