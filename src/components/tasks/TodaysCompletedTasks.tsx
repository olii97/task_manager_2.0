import React from "react";
import { Task, TaskCategory } from "@/types/tasks";
import { TaskSection } from './TaskSection';
import { CheckSquare, Brain, Heart, BookOpen, Users, Zap, Battery, Briefcase, Home, Wrench } from "lucide-react";
import { format, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TodaysCompletedTasksProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}

interface KPIData {
  total: number;
  byPriority: Record<number, number>;
  byCategory: Partial<Record<TaskCategory, number>>;
  byEnergyLevel: Record<string, number>;
}

const calculateKPIs = (tasks: Task[]): KPIData => {
  const kpis: KPIData = {
    total: tasks.length,
    byPriority: { 1: 0, 2: 0, 3: 0, 4: 0 },
    byCategory: {},
    byEnergyLevel: { high: 0, low: 0 },
  };

  tasks.forEach(task => {
    // Count by priority
    kpis.byPriority[task.priority]++;

    // Count by category
    if (task.category) {
      kpis.byCategory[task.category] = (kpis.byCategory[task.category] || 0) + 1;
    }

    // Count by energy level
    if (task.energy_level) {
      kpis.byEnergyLevel[task.energy_level]++;
    }
  });

  return kpis;
};

const renderCategoryIcon = (category: TaskCategory) => {
  switch (category) {
    case 'Create':
      return <Wrench className="h-4 w-4 text-purple-500" />;
    case 'Care':
      return <Heart className="h-4 w-4 text-pink-500" />;
    case 'Consume':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'Connect':
      return <Users className="h-4 w-4 text-green-500" />;
  }
};

const calculateCategoryCounts = (tasks: Task[]): Partial<Record<TaskCategory, number>> => {
  const counts: Partial<Record<TaskCategory, number>> = {};
  tasks.forEach(task => {
    if (task.category) {
      counts[task.category] = (counts[task.category] || 0) + 1;
    }
  });
  return counts;
};

function KPISection({ tasks }: { tasks: Task[] }) {
  const categoryCounts = calculateCategoryCounts(tasks);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {Object.entries(categoryCounts).map(([category, count]) => (
        <Card key={category} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderCategoryIcon(category as TaskCategory)}
              <span className="font-medium">{category}</span>
            </div>
            <Badge variant="secondary">{count}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

const calculateStats = (tasks: Task[]) => {
  const stats = {
    total: tasks.length,
    categories: {} as Partial<Record<TaskCategory, number>>,
    energyLevels: {
      high: 0,
      low: 0,
    },
    taskTypes: {
      work: 0,
      personal: 0,
    },
  };

  tasks.forEach(task => {
    // Count categories
    if (task.category) {
      stats.categories[task.category] = (stats.categories[task.category] || 0) + 1;
    }
    // Count energy levels
    if (task.energy_level) {
      stats.energyLevels[task.energy_level]++;
    }
    // Count task types
    if (task.task_type) {
      stats.taskTypes[task.task_type]++;
    }
  });

  return stats;
};

export function TodaysCompletedTasks({ tasks, onEditTask }: TodaysCompletedTasksProps) {
  const todaysCompletedTasks = tasks.filter(task => {
    if (!task.completion_date || !task.is_completed) return false;
    return isToday(new Date(task.completion_date));
  });

  if (todaysCompletedTasks.length === 0) {
    return null;
  }

  const stats = calculateStats(todaysCompletedTasks);

  return (
    <TaskSection
      title={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-green-500" />
            <span>Completed Today ({stats.total})</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          
          {/* Categories */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="flex items-center gap-2">
                {renderCategoryIcon(category as TaskCategory)}
                <span className="font-medium">{category}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>

          {/* Energy Levels */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-energy-high" />
              <span>{stats.energyLevels.high}</span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4 text-energy-low" />
              <span>{stats.energyLevels.low}</span>
            </div>
          </div>

          {/* Task Types */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{stats.taskTypes.work}</span>
            </div>
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>{stats.taskTypes.personal}</span>
            </div>
          </div>
        </div>
      }
      tasks={todaysCompletedTasks}
      onEditTask={onEditTask}
      collapsible={true}
      defaultOpen={true}
      emptyMessage="No tasks completed today yet."
    />
  );
} 