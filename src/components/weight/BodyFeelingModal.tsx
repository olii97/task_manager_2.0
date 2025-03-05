
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BodyFeeling } from "@/types/weight";

interface BodyFeelingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bodyFeeling: BodyFeeling, feelingNote?: string) => void;
}

export function BodyFeelingModal({ open, onClose, onSave }: BodyFeelingModalProps) {
  const [selectedFeeling, setSelectedFeeling] = useState<BodyFeeling | null>(null);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const feelings: BodyFeeling[] = ['Sore', 'Relaxed', 'Energized', 'Stressed', 'Tired', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeeling) {
      setError("Please select how your body feels");
      return;
    }
    
    onSave(selectedFeeling, note.trim() || undefined);
    reset();
  };

  const reset = () => {
    setSelectedFeeling(null);
    setNote("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How does your body feel today?</DialogTitle>
          <DialogDescription>
            Select an option that best describes how you feel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {feelings.map((feeling) => (
              <Button
                key={feeling}
                type="button"
                variant={selectedFeeling === feeling ? "default" : "outline"}
                className="h-12"
                onClick={() => setSelectedFeeling(feeling)}
              >
                {feeling === 'Sore' && '😣 '}
                {feeling === 'Relaxed' && '😌 '}
                {feeling === 'Energized' && '⚡ '}
                {feeling === 'Stressed' && '😰 '}
                {feeling === 'Tired' && '😴 '}
                {feeling === 'Other' && '🤔 '}
                {feeling}
              </Button>
            ))}
          </div>
          
          {selectedFeeling === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="note">Please specify:</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How do you feel?"
                className="w-full"
              />
            </div>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Skip
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
