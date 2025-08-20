import React from "react";
import { Task } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Plus, Info, ArrowUpDown, Check, ChevronsUpDown } from "lucide-react";
import { DraggableTaskItem } from "./DraggableTaskItem";
import { Droppable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DroppableTaskSectionProps {
  droppableId: string;
  title: string;
  tasks: Task[];
  onAddTask?: () => void;
  onEditTask: (task: Task) => void;
  icon?: React.ReactNode;
  emptyMessage?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  tooltip?: React.ReactNode;
  id?: string;
  selectedTaskId?: string | null;
  onTaskSelect?: (taskId: string) => void;
  onContainerClick?: (droppableId: string) => void;
}

type SortOption = {
  label: string;
  value: string;
  sortFn: (a: Task, b: Task) => number;
};

export function DroppableTaskSection({
  droppableId,
  title,
  tasks,
  onAddTask,
  onEditTask,
  icon,
  emptyMessage = "No tasks yet",
  collapsible = true,
  defaultOpen = false,
  className,
  tooltip,
  id,
  selectedTaskId,
  onTaskSelect,
  onContainerClick,
}: DroppableTaskSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [sortOption, setSortOption] = React.useState<string | null>(null);
  const [isReceivingTask, setIsReceivingTask] = React.useState(false);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  const sortOptions: SortOption[] = [
    {
      label: "Priority (High to Low)",
      value: "priority-desc",
      sortFn: (a, b) => {
        const priorityA = a.priority !== undefined ? a.priority : Infinity;
        const priorityB = b.priority !== undefined ? b.priority : Infinity;
        return priorityA - priorityB;
      }
    },
    {
      label: "Priority (Low to High)",
      value: "priority-asc",
      sortFn: (a, b) => {
        const priorityA = a.priority !== undefined ? a.priority : Infinity;
        const priorityB = b.priority !== undefined ? b.priority : Infinity;
        return priorityB - priorityA;
      }
    },
    {
      label: "Due Date (Earliest First)",
      value: "due-asc",
      sortFn: (a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
    },
    {
      label: "Due Date (Latest First)",
      value: "due-desc",
      sortFn: (a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }
    },
    {
      label: "Name (A to Z)",
      value: "name-asc",
      sortFn: (a, b) => a.title.localeCompare(b.title)
    },
    {
      label: "Name (Z to A)",
      value: "name-desc",
      sortFn: (a, b) => b.title.localeCompare(a.title)
    },
  ];
  
  const sortedTasks = React.useMemo(() => {
    if (!sortOption) return tasks;
    
    const selectedOption = sortOptions.find(option => option.value === sortOption);
    if (!selectedOption) return tasks;
    
    return [...tasks].sort(selectedOption.sortFn);
  }, [tasks, sortOption, sortOptions]);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't handle clicks on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('[role="menuitem"]') ||
      target.closest('.droppable-content') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea')
    ) {
      return;
    }

    if (selectedTaskId && onContainerClick && (droppableId === 'high-energy' || droppableId === 'low-energy')) {
      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Trigger animation immediately
      setIsReceivingTask(true);
      
      // Call the container click handler
      onContainerClick(droppableId);
      
      // Reset animation with a longer delay to ensure it completes
      animationTimeoutRef.current = setTimeout(() => {
        setIsReceivingTask(false);
        animationTimeoutRef.current = null;
      }, 800); // Longer duration to ensure animation completes
    }
  };

  // Determine if this container should be clickable
  const isClickable = selectedTaskId && onContainerClick && (droppableId === 'high-energy' || droppableId === 'low-energy');

    return (
    <div 
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300", 
        className,
        // Animation state - independent of clickable state for consistency
        isReceivingTask && "ring-4 ring-blue-400/50 shadow-2xl scale-105 bg-blue-50/40 border-blue-400",
        // Clickable state - only when not animating to avoid conflicts
        !isReceivingTask && isClickable && "cursor-pointer hover:shadow-lg hover:bg-blue-50/30 hover:border-blue-300"
      )} 
      id={id}
      onClick={handleContainerClick}
    >
      <div className="p-6">
        <div 
          className="flex items-center justify-between mb-4"
        >
            <div className={cn(
              "flex items-center gap-2",
              isReceivingTask && "animate-pulse"
            )}>
              {icon}
              <h3 className="text-lg font-semibold">{title}</h3>
              <span className="text-sm text-muted-foreground">({tasks.length})</span>
              {isReceivingTask && (
                <span className="text-xs text-green-500 font-medium ml-2">
                  ✨ Moving task...
                </span>
              )}
              
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        className="ml-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] p-3 text-xs">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={sortOption ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-2 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOption ? (
                      <span className="hidden sm:inline-block text-xs ml-1">
                        {sortOptions.find(option => option.value === sortOption)?.label.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="hidden sm:inline-block text-xs ml-1">Sort</span>
                    )}
                    <ChevronsUpDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <DropdownMenuItem 
                    onClick={() => setSortOption(null)}
                    className="flex items-center justify-between"
                  >
                    <span>Default Order</span>
                    {!sortOption && <Check className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortOption(option.value)}
                      className="flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {sortOption === option.value && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
            {onAddTask && (
              <Button
              variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask && onAddTask();
                }}
              className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
          </Button>
        )}
            </div>
      </div>
      
      <Droppable droppableId={droppableId}>
          {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
              className="space-y-2 droppable-content"
          >
              {sortedTasks.map((task, index) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={() => onEditTask(task)}
                  isSelected={selectedTaskId === task.id}
                  onSelect={onTaskSelect}
                />
              ))}
            {provided.placeholder}
              {sortedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {emptyMessage}
                </p>
              )}
          </div>
        )}
      </Droppable>
      </div>
    </div>
  );
} 