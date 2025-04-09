
import { Task } from "@/types/tasks";
import { format } from "date-fns";

export type TimeRange = "past-week" | "past-month" | "past-3-months" | "all-time";

/**
 * Filter tasks based on a selected time range
 */
export const filterTasksByTimeRange = (tasks: Task[], timeRange: TimeRange): Task[] => {
  if (timeRange === "all-time") {
    return tasks;
  }

  const now = new Date();
  const cutoffDate = new Date();

  switch (timeRange) {
    case "past-week":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "past-month":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "past-3-months":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    default:
      return tasks;
  }

  return tasks.filter(task => {
    if (!task.completion_date) return false;
    const completionDate = new Date(task.completion_date);
    return completionDate >= cutoffDate && completionDate <= now;
  });
};

/**
 * Prepare tasks data for CSV export
 */
export const tasksToCSV = (tasks: Task[], projects: Record<string, string> = {}): string => {
  if (tasks.length === 0) {
    return "No tasks found for the selected time range";
  }

  // CSV Header
  let csv = "Title,Description,Priority,Completion Date,Project\n";

  // Add task rows
  tasks.forEach(task => {
    const title = task.title?.replace(/,/g, " ").replace(/\n/g, " ") || "";
    const description = task.description?.replace(/,/g, " ").replace(/\n/g, " ") || "";
    const priority = task.priority?.toString() || "";
    const completionDate = task.completion_date 
      ? format(new Date(task.completion_date), "yyyy-MM-dd HH:mm") 
      : "";
    const project = task.project_id ? projects[task.project_id] || "" : "";

    csv += `"${title}","${description}",${priority},"${completionDate}","${project}"\n`;
  });

  return csv;
};

/**
 * Create a downloadable file from tasks data
 */
export const downloadTasksCSV = (tasks: Task[], timeRange: TimeRange, projects: Record<string, string> = {}): void => {
  const filteredTasks = filterTasksByTimeRange(tasks, timeRange);
  const csv = tasksToCSV(filteredTasks, projects);
  
  // Create a blob from the CSV content
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  
  // Create a download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  // Set up the download
  link.setAttribute("href", url);
  link.setAttribute("download", `completed_tasks_${timeRange}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  // Append to the DOM, trigger the download, and remove the element
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
