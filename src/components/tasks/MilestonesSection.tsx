import React, { useState } from 'react';
import { Milestone } from '@/types/milestones';
import { Flag, Calendar, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from '@/types/projects';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';

interface MilestonesSectionProps {
  milestones: Milestone[];
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTask: (task: any) => void;
  onUpdateTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
}

export function MilestonesSection({ 
  milestones, 
  projects,
  onUpdateProject,
  onDeleteProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: MilestonesSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      day: 'numeric'
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
      const project = projects.find(p => p.id === milestone.project_id);
      if (project) {
        setSelectedProject(project);
      }
    }
  };

  const getProjectDetails = (projectId: string | undefined) => {
    if (!projectId) return { name: 'Unknown Project', color: 'gray' };
    const project = projects.find(p => p.id === projectId);
    return {
      name: project?.name || 'Unknown Project',
      color: project?.color || 'gray'
    };
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
          <Flag className="h-4 w-4" />
          Upcoming Milestones
        </h2>
        
        <div className="grid grid-cols-3 gap-3">
          {sortedMilestones.map((milestone) => {
            const daysRemaining = calculateDaysRemaining(milestone.date);
            const isOverdue = daysRemaining < 0;
            const projectDetails = getProjectDetails(milestone.project_id);
            
            return (
              <div
                key={milestone.id}
                onClick={() => handleMilestoneClick(milestone)}
                className={cn(
                  "p-2 rounded-md cursor-pointer transition-colors bg-white shadow-sm",
                  "hover:bg-accent/50",
                  milestone.is_completed && "opacity-50",
                  "border-2"
                )}
                style={{
                  borderColor: milestone.is_main ? undefined : projectDetails.color
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{milestone.title}</h3>
                    {milestone.project_id && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Folder className="h-3 w-3" />
                        <span className="line-clamp-1">{projectDetails.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(milestone.date)}
                    </span>
                    <span className={cn(
                      "font-medium ml-auto",
                      getDaysRemainingClass(daysRemaining)
                    )}>
                      {isOverdue 
                        ? `${Math.abs(daysRemaining)}d overdue`
                        : `${daysRemaining}d`}
                    </span>
                  </div>
                  {milestone.is_main && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mt-1 self-start">
                      Main
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {milestones.length === 0 && (
            <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">
              <p>No milestones yet</p>
            </div>
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </>
  );
} 