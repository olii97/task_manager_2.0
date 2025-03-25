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

interface ProjectListProps {
  projects: Project[];
  taskCounts: Record<string, number>;
}

export function ProjectList({ projects, taskCounts }: ProjectListProps) {
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [projectToDelete, setProjectToDelete] = useState<Project | undefined>(undefined);
  
  const queryClient = useQueryClient();

  const { mutate: deleteProjectMutation } = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectToDelete(undefined);
    }
  });

  const handleEditProject = (project: Project) => {
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
            <Card key={project.id} className={`border-l-4 ${project.color || 'border-primary'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span className="truncate">{project.name}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => setProjectToDelete(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      {projectToDelete && projectToDelete.id === project.id && (
                        <AlertDialogContent>
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
    </div>
  );
} 