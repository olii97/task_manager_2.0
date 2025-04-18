import React, { useState } from 'react';
import { Project } from '@/types/projects';
import { Task } from '@/types/tasks';
import { ProjectDetailView } from './ProjectDetailView';
import { TaskForm } from '../tasks/TaskForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function Projects({
  projects,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditProject,
  onDeleteProject,
}: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    if (selectedProject) {
      onAddTask({
        ...taskData as Omit<Task, 'id'>,
        project_id: selectedProject.id
      });
    }
    setShowTaskForm(false);
    toast.success('Task added successfully');
  };

  const projectTasks = tasks.filter(
    (task) => selectedProject && task.project_id === selectedProject.id
  );

  return (
    <div className="container mx-auto p-4">
      {selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          tasks={tasks.filter(task => task.project_id === selectedProject.id)}
          open={true}
          onClose={handleCloseDetail}
          onAddTask={() => setShowTaskForm(true)}
          onEditTask={onEditTask}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const projectTaskCount = tasks.filter(
            (task) => task.project_id === project.id
          ).length;

          return (
            <Card
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="relative group hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer border hover:border-primary/20"
            >
              <CardContent className="p-4">
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject(project);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-600 line-clamp-2 mb-4">
                  {project.description}
                </p>
                <div className="text-sm text-gray-500">
                  {projectTaskCount} tasks
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSave={handleAddTask}
        title="Add New Task"
        projects={projects}
      />
    </div>
  );
} 