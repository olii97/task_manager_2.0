import React, { useState, useEffect } from "react";
import { Task } from "@/types/tasks";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Briefcase, Home, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";
import { cn } from "@/lib/utils";

interface DaySummaryProps {
  open: boolean;
  onClose: () => void;
  completedTasks: Task[];
}

export function DaySummary({ open, onClose, completedTasks }: DaySummaryProps) {
  const [activeTaskIndex, setActiveTaskIndex] = useState(-1);
  const [showEffort, setShowEffort] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [effortItems, setEffortItems] = useState(['', '', '']);
  const [progressItems, setProgressItems] = useState(['', '', '']);
  const [successItems, setSuccessItems] = useState(['', '', '']);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Filter tasks into work and personal
  const workTasks = completedTasks.filter(task => task.task_type === 'work');
  const personalTasks = completedTasks.filter(task => task.task_type === 'personal');

  // Reset animation state when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTaskIndex(-1);
      setShowEffort(false);
      setShowProgress(false);
      setShowSuccess(false);
      setAnimationComplete(false);
      
      // Start task animation after a short delay
      setTimeout(() => {
        setActiveTaskIndex(0);
      }, 600);
    }
  }, [open]);

  // Handle task animation sequence
  useEffect(() => {
    if (activeTaskIndex >= 0 && activeTaskIndex < completedTasks.length) {
      const timer = setTimeout(() => {
        setActiveTaskIndex(activeTaskIndex + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (activeTaskIndex === completedTasks.length) {
      // All tasks have been animated
      const timer = setTimeout(() => {
        setShowEffort(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTaskIndex, completedTasks.length]);

  // Show progress section after effort section is filled
  useEffect(() => {
    if (effortItems.every(item => item.trim().length > 0) && showEffort) {
      const timer = setTimeout(() => {
        setShowProgress(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [effortItems, showEffort]);

  // Show success section after progress section is filled
  useEffect(() => {
    if (progressItems.every(item => item.trim().length > 0) && showProgress) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progressItems, showProgress]);

  // Show confetti when all sections are filled
  useEffect(() => {
    if (
      effortItems.every(item => item.trim().length > 0) &&
      progressItems.every(item => item.trim().length > 0) &&
      successItems.every(item => item.trim().length > 0) &&
      showSuccess
    ) {
      setShowConfetti(true);
      setAnimationComplete(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [effortItems, progressItems, successItems, showSuccess]);

  const handleUpdateEffortItem = (index: number, value: string) => {
    const newItems = [...effortItems];
    newItems[index] = value;
    setEffortItems(newItems);
  };

  const handleUpdateProgressItem = (index: number, value: string) => {
    const newItems = [...progressItems];
    newItems[index] = value;
    setProgressItems(newItems);
  };

  const handleUpdateSuccessItem = (index: number, value: string) => {
    const newItems = [...successItems];
    newItems[index] = value;
    setSuccessItems(newItems);
  };

  return (
    <>
      <ConfettiEffect isActive={showConfetti} />
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background">
          <div className="p-6 space-y-6 flex flex-col">
            <h2 className="text-2xl font-semibold text-center">Day Summary</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Work Tasks */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="text-lg font-medium">Work Tasks</h3>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {workTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No work tasks completed today.
                    </p>
                  ) : (
                    workTasks.map((task, index) => (
                      <AnimatePresence key={task.id}>
                        {activeTaskIndex > index && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="shadow-sm">
                              <CardContent className="p-3">
                                <div className="flex items-center">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))
                  )}
                </div>
              </div>

              {/* Personal Tasks */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="text-lg font-medium">Personal Tasks</h3>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {personalTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No personal tasks completed today.
                    </p>
                  ) : (
                    personalTasks.map((task, index) => (
                      <AnimatePresence key={task.id}>
                        {activeTaskIndex > index && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="shadow-sm">
                              <CardContent className="p-3">
                                <div className="flex items-center">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Reflection Boxes */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {/* Effort */}
              <AnimatePresence>
                {showEffort && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                  >
                    <h3 className="text-md font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                      What did you put effort into today?
                    </h3>
                    {effortItems.map((item, index) => (
                      <Textarea
                        key={`effort-${index}`}
                        value={item}
                        onChange={(e) => handleUpdateEffortItem(index, e.target.value)}
                        placeholder={`Effort ${index + 1}`}
                        className="resize-none text-sm h-20"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress */}
              <AnimatePresence>
                {showProgress && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                  >
                    <h3 className="text-md font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                      What did you make progress on today?
                    </h3>
                    {progressItems.map((item, index) => (
                      <Textarea
                        key={`progress-${index}`}
                        value={item}
                        onChange={(e) => handleUpdateProgressItem(index, e.target.value)}
                        placeholder={`Progress ${index + 1}`}
                        className="resize-none text-sm h-20"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                  >
                    <h3 className="text-md font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                      What did you succeed at today?
                    </h3>
                    {successItems.map((item, index) => (
                      <Textarea
                        key={`success-${index}`}
                        value={item}
                        onChange={(e) => handleUpdateSuccessItem(index, e.target.value)}
                        placeholder={`Success ${index + 1}`}
                        className="resize-none text-sm h-20"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {animationComplete && (
                <Button 
                  variant="default" 
                  onClick={onClose}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Summary
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 