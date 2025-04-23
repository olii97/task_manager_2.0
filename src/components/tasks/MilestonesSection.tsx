import React, { useState } from 'react';
import { Milestone } from '@/types/milestones';
import { Task } from '@/types/tasks';
import { Button } from '@/components/ui/button';
import { Plus, Check, Calendar } from 'lucide-react';
import { MilestoneForm } from './MilestoneForm';
import { toast } from '@/hooks/use-toast';

interface MilestonesSectionProps {
  milestones: Milestone[];
  onAddTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function MilestonesSection({
  milestones,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: MilestonesSectionProps) {
  const [milestoneFormOpen, setMilestoneFormOpen] = useState(false);

  const calculateDaysRemaining = (date: string) => {
    const today = new Date();
    const milestoneDate = new Date(date);
    const diffTime = milestoneDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    // First sort by completion status
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    // Then sort by date
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMilestoneFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedMilestones.map((milestone) => {
          const daysRemaining = calculateDaysRemaining(milestone.date);
          const isOverdue = daysRemaining < 0 && !milestone.is_completed;
          
          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border ${
                milestone.is_completed
                  ? 'bg-muted/50 border-muted'
                  : isOverdue
                  ? 'border-destructive/50'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {milestone.description}
                    </p>
                  )}
                </div>
                {milestone.is_completed && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(milestone.date)}
                </div>
                {!milestone.is_completed && (
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      isOverdue
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isOverdue
                      ? `${Math.abs(daysRemaining)} days overdue`
                      : `${daysRemaining} days remaining`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {milestones.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No milestones yet. Add one to get started!</p>
        </div>
      )}

      <MilestoneForm
        open={milestoneFormOpen}
        onClose={() => setMilestoneFormOpen(false)}
        onSave={(milestone) => {
          // Handle milestone creation
          setMilestoneFormOpen(false);
          toast({
            title: "Milestone created",
            description: "Your milestone has been created successfully.",
          });
        }}
      />
    </div>
  );
} 