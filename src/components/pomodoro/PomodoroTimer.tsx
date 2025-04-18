import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";
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

export const PomodoroTimer: React.FC = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const handlePomodoroComplete = () => {
    // Refresh the tasks data when Pomodoro completes
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setShowCompletionDialog(true);
  };

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
    isTimerRunning
  } = usePomodoroTimer({
    onComplete: handlePomodoroComplete
  });

  // Don't render if not active
  if (!isTimerRunning && state.status === 'idle') {
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

      // Refresh the tasks data
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

  return (
    <>
      <ConfettiEffect isActive={showConfetti} />
      
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
                <div className="text-sm font-medium mb-4 bg-background/80 p-2 rounded border border-border">
                  {state.currentTask.title}
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
