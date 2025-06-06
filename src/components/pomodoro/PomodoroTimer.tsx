import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";
import { PomodoroCircularTimer } from "./timer/PomodoroCircularTimer";
import { PomodoroControls } from "./timer/PomodoroControls";
import { CompletionDialog } from "./timer/CompletionDialog";
import { usePomodoroTimer } from "./timer/usePomodoroTimer";
import { QuickTaskInput } from "../tasks/QuickTaskInput";
import { useAuth } from "@/components/AuthProvider";
import { addTask } from "@/services/tasks";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export const PomodoroTimer: React.FC = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [showTaskConfetti, setShowTaskConfetti] = useState(false);
  const {
    state,
    showConfetti,
    showCompletionDialog,
    setShowCompletionDialog,
    formatTime,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    handleStartBreak,
    handleSkipBreak,
    isTimerRunning,
    setTimerToFiveSeconds,
    completeCurrentTask
  } = usePomodoroTimer({
    onComplete: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  // Don't render if not active - this is causing problems
  // Only hide the timer when it's completely idle and not running
  if (!isTimerRunning && state.status === 'idle' && !state.currentTask) {
    return null;
  }

  const handleTaskCreated = async (taskData: any) => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create tasks",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTask(session.user.id, {
        ...taskData,
        is_completed: false,
        is_scheduled_today: false,
        user_id: session.user.id
      });

      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      toast({
        title: "Task added",
        description: "Task has been added to your backlog",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTask = async () => {
    if (!state.currentTask) return;
    
    try {
      await completeCurrentTask();
      setShowTaskConfetti(true);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      toast({
        title: "Task completed! 🎉",
        description: `"${state.currentTask.title}" has been marked as complete.`,
      });

      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowTaskConfetti(false);
      }, 3000);

      // Stop the Pomodoro timer after a short delay to show the completion animation
      setTimeout(() => {
        stopPomodoro();
      }, 1500);

    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete the task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <ConfettiEffect isActive={showConfetti || showTaskConfetti} />
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <Card className="w-80 md:w-96 bg-black/80 border-pomodoro-primary/20 shadow-xl backdrop-blur-lg pointer-events-auto">
            <CardContent className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-pomodoro-primary flex items-center">
                  <Timer className="mr-1 h-4 w-4" />
                  {state.isBreak ? "Break Time" : "Focus Mode"}
                </h3>
                <div className="text-xs bg-pomodoro-primary/20 text-pomodoro-primary px-2 py-1 rounded-full">
                  🔥 {state.sessionsCompleted} Today
                </div>
              </div>
              
              {state.currentTask && !state.isBreak && (
                <div className="mb-4 space-y-2">
                  <div className="text-sm font-medium bg-background/80 p-2 rounded border border-border">
                    {state.currentTask.title}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-medium border-green-500 text-green-500 hover:bg-green-500/10"
                    onClick={handleCompleteTask}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Complete Task
                  </Button>
                </div>
              )}
              
              <PomodoroCircularTimer
                timeRemaining={state.timeRemaining}
                originalDuration={state.originalDuration}
                isBreak={state.isBreak}
                formatTime={formatTime}
              />
              
              <PomodoroControls
                status={state.status}
                isBreak={state.isBreak}
                onPause={pausePomodoro}
                onResume={resumePomodoro}
                onStop={stopPomodoro}
              />

              {!state.isBreak && state.status === "running" && (
                <div className="mt-4 border-t border-border/20 pt-4">
                  <QuickTaskInput onTaskCreated={handleTaskCreated} />
                </div>
              )}

              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setTimerToFiveSeconds}
                  className="mt-4"
                >
                  Test: Set 5s
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <CompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        sessionsCompleted={state.sessionsCompleted}
        onStartBreak={handleStartBreak}
        onSkipBreak={handleSkipBreak}
      />
    </>
  );
};
