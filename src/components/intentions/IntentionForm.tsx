
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updateWeeklyIntention } from "@/services/intentionService";
import { WeeklyIntention } from "@/types/intentions";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface IntentionFormProps {
  intentions: WeeklyIntention;
  isCurrentWeek: boolean;
}

export const IntentionForm = ({ intentions, isCurrentWeek }: IntentionFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [intention1, setIntention1] = useState(intentions.intention_1 || "");
  const [intention2, setIntention2] = useState(intentions.intention_2 || "");
  const [intention3, setIntention3] = useState(intentions.intention_3 || "");
  const [reflection1, setReflection1] = useState(intentions.reflection_1 || "");
  const [reflection2, setReflection2] = useState(intentions.reflection_2 || "");
  const [reflection3, setReflection3] = useState(intentions.reflection_3 || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const updateMutation = useMutation({
    mutationFn: async (updatedData: Partial<WeeklyIntention>) => {
      if (!intentions?.id) throw new Error("No intention ID found");
      return await updateWeeklyIntention(intentions.id, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intention"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-intentions"] });
      queryClient.invalidateQueries({ queryKey: ["all-intentions"] });
      
      toast({
        title: "Intentions updated",
        description: "Your weekly intentions have been saved successfully.",
      });
      
      navigate("/intentions");
    },
    onError: (error) => {
      console.error("Error updating intentions:", error);
      toast({
        title: "Error saving intentions",
        description: "There was a problem saving your intentions. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Ensure submitting state is reset whether success or error
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    const updatedData = {
      intention_1: intention1.trim() || null,
      intention_2: intention2.trim() || null,
      intention_3: intention3.trim() || null,
      reflection_1: reflection1.trim() || null,
      reflection_2: reflection2.trim() || null,
      reflection_3: reflection3.trim() || null,
    };
    
    updateMutation.mutate(updatedData);
  };

  const handleCancel = () => {
    navigate("/intentions");
  };

  const weekStartDate = new Date(intentions.week_start);
  const formattedWeekStart = format(weekStartDate, "MMMM d, yyyy");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          Edit Weekly Intentions
        </h1>
        <p className="text-muted-foreground">
          For the week of {formattedWeekStart}
          {isCurrentWeek && " (Current Week)"}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Set Your Intentions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intention1">Intention 1</Label>
            <Textarea
              id="intention1"
              placeholder="What do you intend to focus on this week?"
              value={intention1}
              onChange={(e) => setIntention1(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reflection1">Reflection on Intention 1</Label>
            <Textarea
              id="reflection1"
              placeholder="Reflect on how you did with this intention (Optional)"
              value={reflection1}
              onChange={(e) => setReflection1(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="intention2">Intention 2</Label>
            <Textarea
              id="intention2"
              placeholder="What's another area you want to focus on? (Optional)"
              value={intention2}
              onChange={(e) => setIntention2(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reflection2">Reflection on Intention 2</Label>
            <Textarea
              id="reflection2"
              placeholder="Reflect on how you did with this intention (Optional)"
              value={reflection2}
              onChange={(e) => setReflection2(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="intention3">Intention 3</Label>
            <Textarea
              id="intention3"
              placeholder="One more intention for the week? (Optional)"
              value={intention3}
              onChange={(e) => setIntention3(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reflection3">Reflection on Intention 3</Label>
            <Textarea
              id="reflection3"
              placeholder="Reflect on how you did with this intention (Optional)"
              value={reflection3}
              onChange={(e) => setReflection3(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
            </>
          ) : (
            "Save Intentions"
          )}
        </Button>
      </div>
    </form>
  );
};
