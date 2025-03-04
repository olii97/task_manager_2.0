
import React from "react";
import { Task } from "@/types/tasks";
import { TaskSection } from "@/components/tasks/TaskSection";
import { Zap, Battery } from "lucide-react";

interface TodaysSectionsProps {
  highEnergyTasks: Task[];
  lowEnergyTasks: Task[];
  onEditTask: (task: Task) => void;
}

export function TodaysSections({ 
  highEnergyTasks, 
  lowEnergyTasks, 
  onEditTask 
}: TodaysSectionsProps) {
  return (
    <>
      {/* Today's High Energy Tasks */}
      <TaskSection
        title="Today's High Energy Tasks"
        tasks={highEnergyTasks}
        onEditTask={onEditTask}
        icon={<Zap className="h-5 w-5" />}
        emptyMessage="No high energy tasks scheduled for today."
      />

      {/* Today's Low Energy Tasks */}
      <TaskSection
        title="Today's Low Energy Tasks"
        tasks={lowEnergyTasks}
        onEditTask={onEditTask}
        icon={<Battery className="h-5 w-5" />}
        emptyMessage="No low energy tasks scheduled for today."
      />
    </>
  );
}
