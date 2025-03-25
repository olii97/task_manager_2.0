import React, { useState, useEffect } from "react";
import { Project } from "@/types/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addProject, updateProject } from "@/services/projects/projectService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
}

// Available project colors with their class names and labels
const projectColors = [
  { value: "border-blue-500", label: "Blue", bg: "bg-blue-100" },
  { value: "border-green-500", label: "Green", bg: "bg-green-100" },
  { value: "border-red-500", label: "Red", bg: "bg-red-100" },
  { value: "border-yellow-500", label: "Yellow", bg: "bg-yellow-100" },
  { value: "border-purple-500", label: "Purple", bg: "bg-purple-100" },
  { value: "border-pink-500", label: "Pink", bg: "bg-pink-100" },
  { value: "border-indigo-500", label: "Indigo", bg: "bg-indigo-100" },
  { value: "border-orange-500", label: "Orange", bg: "bg-orange-100" },
];

export function ProjectForm({ open, onClose, project }: ProjectFormProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "border-blue-500",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color || "border-blue-500",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: "border-blue-500",
      });
    }
  }, [project, open]);

  const { mutate: addProjectMutation, isPending: isAddingProject } = useMutation({
    mutationFn: (projectData: Omit<Project, "id" | "created_at" | "updated_at" | "user_id">) => 
      addProject(session?.user.id!, projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    }
  });

  const { mutate: updateProjectMutation, isPending: isUpdatingProject } = useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => 
      updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    if (project) {
      updateProjectMutation({
        projectId: project.id,
        updates: {
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
        }
      });
    } else {
      addProjectMutation({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
      });
    }
  };

  const isPending = isAddingProject || isUpdatingProject;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a description for this project"
              rows={3}
              maxLength={200}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Project Color</Label>
            <RadioGroup
              value={formData.color}
              onValueChange={handleColorChange}
              className="grid grid-cols-4 gap-2 pt-1"
            >
              {projectColors.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={color.value}
                    id={color.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={color.value}
                    className={`w-full p-2 rounded border cursor-pointer ${color.bg} flex justify-center items-center transition-all peer-focus:ring-2 peer-focus:ring-offset-1 ${
                      formData.color === color.value
                        ? `border-2 ring-2 ring-offset-1 ${color.value.replace('border', 'ring')}`
                        : "border-gray-200"
                    }`}
                  >
                    {color.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 