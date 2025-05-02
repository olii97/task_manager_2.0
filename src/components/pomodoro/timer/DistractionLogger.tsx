import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { logPomodoroDistraction } from '@/services/pomodoroService';
import { useToast } from '@/hooks/use-toast';

interface DistractionLoggerProps {
  sessionId: string;
  onClose: () => void;
}

export const DistractionLogger: React.FC<DistractionLoggerProps> = ({ sessionId, onClose }) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      await logPomodoroDistraction({
        session_id: sessionId,
        description: description.trim()
      });
      
      toast({
        title: "Distraction logged",
        description: "Your distraction has been recorded.",
      });
      
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error logging distraction:', error);
      toast({
        title: "Error",
        description: "Could not log the distraction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Distraction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input
              placeholder="What distracted you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Distraction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 