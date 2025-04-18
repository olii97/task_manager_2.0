import React, { useState } from "react";
import { Project } from "@/types/projects";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Folder } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProjectForm } from "./ProjectForm";
import { Badge } from "@/components/ui/badge";
import { deleteProject } from "@/services/projects/projectService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Dialog } from "@/components/ui/dialog";
import { ProjectDetailView } from "./ProjectDetailView";
import { Task } from "@/types/tasks";

interface ProjectListProps {
  projects: Project[];
  taskCounts: Record<string, number>;
  tasks?: Task[];
  onAddTask?: (task: Omit<Task, 'id'>) => void;
  onEditTask?: (task: Task) => void;
}

export function ProjectList({ projects, taskCounts, tasks = [], onAddTask, onEditTask }: ProjectListProps) {
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [projectToDelete, setProjectToDelete] = useState<Project | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const queryClient = useQueryClient();

  const { mutate: deleteProjectMutation } = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectToDelete(undefined);
    }
  });

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setProjectFormOpen(true);
  };

  const handleCloseForm = () => {
    setProjectFormOpen(false);
    setEditingProject(undefined);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation(projectToDelete.id);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Folder className="h-5 w-5 mr-2" />
          Projects
        </h2>
        <Button onClick={() => setProjectFormOpen(true)} size="sm">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-6 text-center text-muted-foreground">
              No projects yet. Create your first project to organize your tasks!
            </CardContent>
          </Card>
        ) : (
          projects.map(project => (
            <Card 
              key={project.id} 
              className={`border-l-4 ${project.color || 'border-primary'} cursor-pointer transition-all duration-200 hover:shadow-lg`}
              onClick={() => handleProjectClick(project)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span className="truncate">{project.name}</span>
                  <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={(e) => handleEditProject(e, project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      {projectToDelete && projectToDelete.id === project.id && (
                        <AlertDialogContent onClick={e => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the project "{project.name}". This action cannot be undone.
                              {taskCounts[project.id] > 0 && (
                                <span className="font-semibold block mt-2 text-destructive">
                                  Warning: This project has {taskCounts[project.id]} tasks. These tasks will be unlinked from this project.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteProject}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="py-3">
                {project.description ? (
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Badge variant="outline">
                  {taskCounts[project.id] || 0} tasks
                </Badge>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <ProjectForm
        open={projectFormOpen}
        onClose={handleCloseForm}
        project={editingProject}
      />

      <Dialog open={selectedProject !== null} onOpenChange={(open) => !open && handleCloseDetail()}>
        {selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            tasks={tasks.filter(task => task.project_id === selectedProject.id)}
            open={true}
            onClose={handleCloseDetail}
            onAddTask={() => onAddTask && onAddTask({ title: '', project_id: selectedProject.id } as any)}
            onEditTask={(task) => onEditTask && onEditTask(task)}
          />
        )}
      </Dialog>
    </div>
  );
} 