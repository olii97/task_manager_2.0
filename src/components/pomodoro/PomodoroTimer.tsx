
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfettiEffect } from "@/components/animations/ConfettiEffect";
import { PomodoroCircularTimer } from "./timer/PomodoroCircularTimer";
import { PomodoroControls } from "./timer/PomodoroControls";
import { DistractionDialog } from "./timer/DistractionDialog";
import { CompletionDialog } from "./timer/CompletionDialog";
import { usePomodoroTimer } from "./timer/usePomodoroTimer";

export const PomodoroTimer: React.FC = () => {
  const {
    state,
    showConfetti,
    showDistractionDialog,
    setShowDistractionDialog,
    showCompletionDialog,
    setShowCompletionDialog,
    formatTime,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    handleAddDistraction,
    handleStartBreak,
    handleSkipBreak,
    handleLogDistraction,
    cancelDistraction,
    isTimerRunning
  } = usePomodoroTimer();

  // Don't render if not active
  if (!isTimerRunning && state.status === 'idle') {
    return null;
  }

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
            <CardContent className="p-6">
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
                onLogDistraction={handleLogDistraction}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Dialogs */}
      <DistractionDialog
        open={showDistractionDialog}
        onOpenChange={setShowDistractionDialog}
        onAddDistraction={handleAddDistraction}
        onCancel={cancelDistraction}
      />

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
