
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle, Coffee } from "lucide-react";

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionsCompleted: number;
  onStartBreak: () => void;
  onSkipBreak: () => void;
}

export const CompletionDialog: React.FC<CompletionDialogProps> = ({
  open,
  onOpenChange,
  sessionsCompleted,
  onStartBreak,
  onSkipBreak,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-pomodoro-primary">
            🎉 Pomodoro Completed!
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <h3 className="text-xl font-bold mb-2">+20 XP Earned!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Great work! Take a break before your next focus session.
          </p>
          <div className="bg-pomodoro-primary/10 p-3 rounded-lg mb-4">
            <p className="text-sm font-medium">
              🔥 {sessionsCompleted} Focus Sessions Completed Today
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onSkipBreak}
            className="sm:flex-1"
          >
            <XCircle className="mr-1 h-4 w-4" /> Skip Break
          </Button>
          <Button 
            onClick={onStartBreak}
            variant="outline"
            className="sm:flex-1"
          >
            <Coffee className="mr-1 h-4 w-4" /> Take a 5 Min Break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
