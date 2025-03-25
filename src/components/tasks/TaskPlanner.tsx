import React, { useState } from "react";
import { Task, priorityEmojis } from "@/types/tasks";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical, Zap, Battery, Plus } from "lucide-react";
import { bulkScheduleTasks } from "@/services/tasks/taskBatchService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface TaskPlannerProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddTask: () => void; // Changed to match what Index.tsx provides
}

export function TaskPlanner({ open, onClose, tasks, onAddTask }: TaskPlannerProps) {
  
  const [selectedHighEnergyTasks, setSelectedHighEnergyTasks] = useState<string[]>([]);
  const [selectedLowEnergyTasks, setSelectedLowEnergyTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("high");
  
  const queryClient = useQueryClient();

  const backlogTasks = tasks.filter(task => 
    !task.is_completed && !task.is_scheduled_today
  ).sort((a, b) => a.priority - b.priority);

  const { mutate: scheduleHighEnergyTasks, isPending: isSchedulingHigh } = useMutation({
    mutationFn: (taskIds: string[]) => bulkScheduleTasks(taskIds, 'high'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedHighEnergyTasks([]);
      setActiveTab("low");
    }
  });

  const { mutate: scheduleLowEnergyTasks, isPending: isSchedulingLow } = useMutation({
    mutationFn: (taskIds: string[]) => bulkScheduleTasks(taskIds, 'low'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedLowEnergyTasks([]);
      onClose();
      toast({
        title: "Daily tasks planned!",
        description: "Your tasks have been scheduled for today.",
      });
    }
  });

  const toggleHighEnergyTask = (taskId: string) => {
    setSelectedHighEnergyTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleLowEnergyTask = (taskId: string) => {
    setSelectedLowEnergyTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleHighEnergySubmit = () => {
    if (selectedHighEnergyTasks.length === 0) {
      setActiveTab("low");
      return;
    }
    scheduleHighEnergyTasks(selectedHighEnergyTasks);
  };

  const handleLowEnergySubmit = () => {
    if (selectedLowEnergyTasks.length === 0) {
      onClose();
      return;
    }
    scheduleLowEnergyTasks(selectedLowEnergyTasks);
  };

  const handleNext = () => {
    if (activeTab === "high") {
      handleHighEnergySubmit();
    } else {
      handleLowEnergySubmit();
    }
  };

  const getButtonText = () => {
    if (activeTab === "high") {
      return selectedHighEnergyTasks.length > 0 
        ? `Schedule ${selectedHighEnergyTasks.length} High Energy Task${selectedHighEnergyTasks.length > 1 ? 's' : ''}` 
        : "Skip to Low Energy Tasks";
    } else {
      return selectedLowEnergyTasks.length > 0 
        ? `Schedule ${selectedLowEnergyTasks.length} Low Energy Task${selectedLowEnergyTasks.length > 1 ? 's' : ''}` 
        : "Skip Planning";
    }
  };

  const remainingTasks = backlogTasks.filter(
    task => !selectedHighEnergyTasks.includes(task.id)
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <FlaskConical className="h-5 w-5 mr-2" />
            Plan Your Day
          </DialogTitle>
          <DialogDescription>
            Select tasks from your backlog to focus on today
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddTask}
            className="flex items-center text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Task to Backlog
          </Button>
        </div>

        <Tabs defaultValue="high" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="high" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              High Energy Tasks (2-3)
            </TabsTrigger>
            <TabsTrigger value="low" className="flex items-center">
              <Battery className="h-4 w-4 mr-2" />
              Low Energy Tasks (2-3)
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "high" && (
                <TabsContent value="high" className="max-h-[400px] overflow-y-auto">
                  {backlogTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks in your backlog. Create some tasks first!
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {backlogTasks.map((task, index) => (
                        <motion.div 
                          key={task.id}
                          variants={itemVariants}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer hover:bg-gray-50 ${
                              selectedHighEnergyTasks.includes(task.id) ? 'border-blue-300 bg-blue-50' : ''
                            }`}
                            onClick={() => toggleHighEnergyTask(task.id)}
                          >
                            <CardContent className="p-3 flex items-center">
                              <Checkbox 
                                checked={selectedHighEnergyTasks.includes(task.id)}
                                onCheckedChange={() => toggleHighEnergyTask(task.id)}
                                className="mr-3"
                              />
                              <div className="flex-grow">
                                <div className="flex items-center">
                                  <span className="mr-2">{priorityEmojis[task.priority]}</span>
                                  <span>{task.title}</span>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
              )}
              
              {activeTab === "low" && (
                <TabsContent value="low" className="max-h-[400px] overflow-y-auto">
                  {remainingTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks available. Add more tasks to your backlog!
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {remainingTasks.map((task, index) => (
                        <motion.div 
                          key={task.id}
                          variants={itemVariants}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer hover:bg-gray-50 ${
                              selectedLowEnergyTasks.includes(task.id) ? 'border-blue-300 bg-blue-50' : ''
                            }`}
                            onClick={() => toggleLowEnergyTask(task.id)}
                          >
                            <CardContent className="p-3 flex items-center">
                              <Checkbox 
                                checked={selectedLowEnergyTasks.includes(task.id)}
                                onCheckedChange={() => toggleLowEnergyTask(task.id)}
                                className="mr-3"
                              />
                              <div className="flex-grow">
                                <div className="flex items-center">
                                  <span className="mr-2">{priorityEmojis[task.priority]}</span>
                                  <span>{task.title}</span>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleNext}
              disabled={isSchedulingHigh || isSchedulingLow}
              className="relative overflow-hidden"
            >
              <span className="relative z-10">
                {isSchedulingHigh || isSchedulingLow ? "Scheduling..." : getButtonText()}
              </span>
              <motion.div
                className="absolute inset-0 bg-blue-200 opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
