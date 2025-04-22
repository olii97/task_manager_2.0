import React from 'react';
import { Milestone } from '@/types/milestones';
import { Flag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MilestonesSectionProps {
  milestones: Milestone[];
}

export function MilestonesSection({ milestones }: MilestonesSectionProps) {
  const navigate = useNavigate();

  const calculateDaysRemaining = (date: string) => {
    const today = new Date();
    const milestoneDate = new Date(date);
    const diffTime = milestoneDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingClass = (days: number) => {
    if (days < 0) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Sort milestones by date and take the three closest ones
  const sortedMilestones = [...milestones]
    .sort((a, b) => {
      const daysA = calculateDaysRemaining(a.date);
      const daysB = calculateDaysRemaining(b.date);
      return daysA - daysB;
    })
    .slice(0, 3);

  const handleMilestoneClick = (milestone: Milestone) => {
    if (milestone.project_id) {
      navigate(`/projects/${milestone.project_id}`);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Flag className="h-5 w-5" />
        Upcoming Milestones
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        {sortedMilestones.map((milestone) => {
          const daysRemaining = calculateDaysRemaining(milestone.date);
          const isOverdue = daysRemaining < 0;
          
          return (
            <div
              key={milestone.id}
              onClick={() => handleMilestoneClick(milestone)}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                milestone.is_completed && "opacity-50",
                milestone.is_main && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-medium mb-1 line-clamp-1">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDate(milestone.date)}
                  </span>
                  <span className={cn(
                    "font-medium ml-auto",
                    getDaysRemainingClass(daysRemaining)
                  )}>
                    {isOverdue 
                      ? `${Math.abs(daysRemaining)} days overdue`
                      : `${daysRemaining} days remaining`}
                  </span>
                </div>
                {milestone.is_main && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary mt-2 self-start">
                    Main Milestone
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {milestones.length === 0 && (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            <p>No milestones yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 