import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircle, CheckCircle } from "lucide-react";
import { analyzeTaskText } from "@/services/quickTaskService";
import { useToast } from "@/hooks/use-toast";

interface DistractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDistraction: (description: string) => void;
  onCancel: () => void;
}

export const DistractionDialog: React.FC<DistractionDialogProps> = ({
  open,
  onOpenChange,
  onAddDistraction,
  onCancel,
}) => {
  const [distractionText, setDistractionText] = useState("");
  const { toast } = useToast();

  const handleAddDistraction = () => {
    if (distractionText.trim() === "") return;
    
    // Close the dialog immediately
    setDistractionText("");
    onOpenChange(false);
    
    // Start background analysis
    analyzeTaskText(distractionText)
      .then(analyzedTask => {
        // Add the distraction with the analyzed title
        onAddDistraction(analyzedTask.title);
        toast({
          title: "Distraction Analyzed",
          description: "Your distraction has been analyzed and added to your tasks.",
        });
      })
      .catch(error => {
        console.error('Error analyzing distraction:', error);
        // Fallback to using the raw text if analysis fails
        onAddDistraction(distractionText);
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the distraction, but it was still logged.",
          variant: "destructive",
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Distraction</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            What distracted you? We'll analyze it and add it to your task backlog.
          </p>
          <Input
            value={distractionText}
            onChange={(e) => setDistractionText(e.target.value)}
            placeholder="What was the distraction?"
            className="mb-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddDistraction();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            <XCircle className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button 
            onClick={handleAddDistraction}
            disabled={distractionText.trim() === ""}
          >
            <CheckCircle className="mr-1 h-4 w-4" /> Add & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
