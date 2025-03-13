
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircle, CheckCircle } from "lucide-react";

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

  const handleAddDistraction = () => {
    if (distractionText.trim() === "") return;
    
    onAddDistraction(distractionText);
    setDistractionText("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Distraction</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            What distracted you? We'll add this to your task backlog.
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
          <Button onClick={handleAddDistraction}>
            <CheckCircle className="mr-1 h-4 w-4" /> Add & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
