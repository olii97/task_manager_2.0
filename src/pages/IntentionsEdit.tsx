
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { getCurrentWeekIntentions, createWeeklyIntention, updateWeeklyIntention } from "@/services/intentionService";
import { getCurrentWeekStart } from "@/types/intentions";
import { Loader2 } from "lucide-react";

const IntentionsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const currentWeekStart = getCurrentWeekStart();
  
  const [intention1, setIntention1] = useState("");
  const [intention2, setIntention2] = useState("");
  const [intention3, setIntention3] = useState("");
  const [reflection1, setReflection1] = useState("");
  const [reflection2, setReflection2] = useState("");
  const [reflection3, setReflection3] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current intentions if editing
  const { data: intentions, isLoading, isError } = useQuery({
    queryKey: ["intention", id || "current", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // If we have an ID, we're editing a specific intention
      if (id) {
        // This would normally fetch by ID, but for simplicity we're using the current week
        // In a real app, you would implement a getIntentionById function
        return await getCurrentWeekIntentions(userId);
      }
      
      // Otherwise, get or create current week's intentions
      const currentIntentions = await getCurrentWeekIntentions(userId);
      if (!currentIntentions) {
        // Create new intentions for this week if none exist
        return await createWeeklyIntention(userId, {});
      }
      return currentIntentions;
    },
    enabled: !!userId,
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (intentions) {
      setIntention1(intentions.intention_1 || "");
      setIntention2(intentions.intention_2 || "");
      setIntention3(intentions.intention_3 || "");
      setReflection1(intentions.reflection_1 || "");
      setReflection2(intentions.reflection_2 || "");
      setReflection3(intentions.reflection_3 || "");
    }
  }, [intentions]);

  // Set page title
  useEffect(() => {
    document.title = id ? "Edit Weekly Intentions | Daily Driver" : "Set Weekly Intentions | Daily Driver";
  }, [id]);

  // Handle form submission
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!intentions?.id) throw new Error("No intention ID found");
      
      return await updateWeeklyIntention(intentions.id, {
        intention_1: intention1.trim() || null,
        intention_2: intention2.trim() || null,
        intention_3: intention3.trim() || null,
        reflection_1: reflection1.trim() || null,
        reflection_2: reflection2.trim() || null,
        reflection_3: reflection3.trim() || null,
      });
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
      setIsSubmitting(false);  // Make sure to reset submitting state on error
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    try {
      await updateMutation.mutateAsync();
    } catch (error) {
      // Error will be handled in the onError callback of the mutation
      console.error("Submit error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              There was a problem loading your intentions. Please try again.
            </p>
            <Button onClick={() => navigate("/intentions")}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekStartDate = new Date(intentions?.week_start || currentWeekStart);
  const formattedWeekStart = format(weekStartDate, "MMMM d, yyyy");
  
  const isCurrentWeek = intentions?.week_start === currentWeekStart;

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          {id ? "Edit Weekly Intentions" : "Set Weekly Intentions"}
        </h1>
        <p className="text-muted-foreground">
          For the week of {formattedWeekStart}
          {isCurrentWeek && " (Current Week)"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            onClick={() => navigate("/intentions")}
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
    </div>
  );
};

export default IntentionsEdit;
