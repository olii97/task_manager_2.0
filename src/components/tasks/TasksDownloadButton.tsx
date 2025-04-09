
import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/tasks";
import { Project } from "@/types/projects";
import { TimeRange, downloadTasksCSV } from "@/utils/taskExport";
import { toast } from "@/hooks/use-toast";

interface TasksDownloadButtonProps {
  tasks: Task[];
  projects: Project[];
}

export function TasksDownloadButton({ tasks, projects }: TasksDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Convert projects array to a map for easier lookup
  const projectMap: Record<string, string> = {};
  projects.forEach(project => {
    projectMap[project.id] = project.name;
  });
  
  const completedTasks = tasks.filter(task => task.is_completed);
  
  const handleDownload = (timeRange: TimeRange) => {
    setIsDownloading(true);
    
    try {
      downloadTasksCSV(completedTasks, timeRange, projectMap);
      toast({
        title: "Download started",
        description: "Your tasks have been downloaded as a CSV file.",
      });
    } catch (error) {
      console.error("Error downloading tasks:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your tasks.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isDownloading || completedTasks.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Download Tasks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("past-week")}>
          Past Week
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("past-month")}>
          Past Month
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("past-3-months")}>
          Past 3 Months
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("all-time")}>
          All Time
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
