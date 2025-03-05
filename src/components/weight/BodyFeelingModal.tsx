
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BodyFeeling, bodyFeelingEmoji } from "@/types/weight";

interface BodyFeelingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (feeling: BodyFeeling, note?: string) => void;
}

export const BodyFeelingModal = ({ open, onClose, onSave }: BodyFeelingModalProps) => {
  const [selectedFeeling, setSelectedFeeling] = useState<BodyFeeling | null>(null);
  const [note, setNote] = useState<string>("");
  const feelings: BodyFeeling[] = ["Sore", "Relaxed", "Energized", "Stressed", "Tired", "Other"];

  const handleSubmit = () => {
    if (selectedFeeling) {
      onSave(selectedFeeling, note);
      reset();
    }
  };

  const reset = () => {
    setSelectedFeeling(null);
    setNote("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How does your body feel today?</DialogTitle>
          <DialogDescription>
            This helps track how your body responds to weight changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {feelings.map((feeling) => (
              <Button
                key={feeling}
                type="button"
                variant={selectedFeeling === feeling ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => setSelectedFeeling(feeling)}
              >
                <span className="text-xl">{bodyFeelingEmoji[feeling]}</span>
                <span>{feeling}</span>
              </Button>
            ))}
          </div>
          
          {selectedFeeling === "Other" && (
            <div className="grid gap-2">
              <Textarea
                placeholder="Describe how you feel today..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Skip
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!selectedFeeling}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
