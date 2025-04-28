import React, { useState, useEffect } from "react";
import { Task } from "@/types/tasks";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Briefcase, Home, Sparkles } from "lucide-react";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [momentaryConfetti, setMomentaryConfetti] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);

  // Filter tasks into work and personal
  const workTasks = completedTasks.filter(task => task.task_type === 'work');
  const personalTasks = completedTasks.filter(task => task.task_type === 'personal');
  const totalTasks = completedTasks.length;

  // Reset animation state when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTaskIndex(-1);
      setShowEffort(false);
      setShowProgress(false);
      setShowSuccess(false);
      setAnimationComplete(false);
      setMomentaryConfetti(false);
      setShowConfetti(false);
      setIsReadyToAnimate(false);

      // Start task animation after a short delay
      setTimeout(() => {
        setIsReadyToAnimate(true);
        setActiveTaskIndex(0);
      }, 500);
    } else {
      setIsReadyToAnimate(false);
    }
  }, [open]);

  // Handle task animation sequence and per-task confetti
  useEffect(() => {
    if (activeTaskIndex >= 0 && activeTaskIndex < totalTasks) {
      // Trigger momentary confetti for the appearing task
      setMomentaryConfetti(true);
      const confettiTimer = setTimeout(() => setMomentaryConfetti(false), 1000); // Confetti for 1 second
      
      // Proceed to the next task
      const taskTimer = setTimeout(() => {
        setActiveTaskIndex(activeTaskIndex + 1);
      }, 300); // Delay between tasks
      
      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(taskTimer);
      };
    } else if (activeTaskIndex === totalTasks && totalTasks > 0) {
      // All tasks have been animated, show effort section
      const effortTimer = setTimeout(() => {
        setShowEffort(true);
      }, 500);
      return () => clearTimeout(effortTimer);
    } else if (totalTasks === 0 && open) {
      // If no tasks, show effort section immediately
      setShowEffort(true);
    }
  }, [activeTaskIndex, totalTasks, open]);

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

  // Show FINAL confetti when all reflection sections are filled
  useEffect(() => {
    if (
      effortItems.every(item => item.trim().length > 0) &&
      progressItems.every(item => item.trim().length > 0) &&
      successItems.every(item => item.trim().length > 0) &&
      showSuccess
    ) {
      setShowConfetti(true); // Trigger final confetti
      setAnimationComplete(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // Show final confetti for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [effortItems, progressItems, successItems, showSuccess]);

  // Handlers for text areas (keep unchanged)
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
      {/* Separate confetti for per-task and final celebration */} 
      <ConfettiEffect isActive={momentaryConfetti} duration={500} particleCount={50} />
      <ConfettiEffect isActive={showConfetti} duration={3000} /> 

      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background">
          <div className="p-6 space-y-6 flex flex-col">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Day Summary</h2>
              <p className="text-muted-foreground">You completed {totalTasks} tasks today!</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Work Tasks */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="text-lg font-medium">Work Tasks</h3>
                </div>
                <ScrollArea className="h-[250px] rounded-md border">
                  <div className="space-y-2 p-4">
                    {workTasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No work tasks completed today.
                      </p>
                    ) : (
                      isReadyToAnimate &&
                      workTasks.slice(0, activeTaskIndex).map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          layout
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
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Personal Tasks */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="text-lg font-medium">Personal Tasks</h3>
                </div>
                <ScrollArea className="h-[250px] rounded-md border">
                  <div className="space-y-2 p-4">
                    {personalTasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No personal tasks completed today.
                      </p>
                    ) : (
                      isReadyToAnimate &&
                      personalTasks.slice(0, activeTaskIndex).map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          layout
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
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Reflection Boxes */}
            {/* Ensure these appear smoothly without causing layout shifts */}
            <div className="grid grid-cols-3 gap-4 mt-6 min-h-[180px]"> {/* Added min-height */} 
              {/* Effort */}
              <AnimatePresence>
                {showEffort && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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