
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BodyFeeling } from "@/types/weight";
import { CheckCircle } from "lucide-react";

interface BodyFeelingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bodyFeeling: BodyFeeling, feelingNote?: string) => void;
}

export function BodyFeelingModal({ open, onClose, onSave }: BodyFeelingModalProps) {
  const [selectedFeeling, setSelectedFeeling] = useState<BodyFeeling | null>(null);
  const [note, setNote] = useState<string>("");
  const [otherSelected, setOtherSelected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bodyFeelings: BodyFeeling[] = ["Sore", "Relaxed", "Energized", "Stressed", "Tired", "Other"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeeling) {
      setError("Please select how your body feels");
      return;
    }

    if (selectedFeeling === "Other" && !note.trim()) {
      setError("Please provide details for 'Other'");
      return;
    }
    
    onSave(selectedFeeling, note.trim() || undefined);
    resetForm();
  };

  const resetForm = () => {
    setSelectedFeeling(null);
    setNote("");
    setOtherSelected(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFeelingSelect = (feeling: BodyFeeling) => {
    setSelectedFeeling(feeling);
    setOtherSelected(feeling === "Other");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Body Check-in</DialogTitle>
          <DialogDescription>
            How does your body feel today?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {bodyFeelings.map((feeling) => (
              <Button
                key={feeling}
                type="button"
                variant={selectedFeeling === feeling ? "default" : "outline"}
                className="flex justify-between items-center"
                onClick={() => handleFeelingSelect(feeling)}
              >
                <span>{feeling}</span>
                {selectedFeeling === feeling && <CheckCircle className="h-4 w-4 ml-1" />}
              </Button>
            ))}
          </div>
          
          {otherSelected && (
            <div className="space-y-2">
              <Label htmlFor="note">Additional Details</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe how you feel..."
                className="w-full"
              />
            </div>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
