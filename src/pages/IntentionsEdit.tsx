import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { getCurrentWeekIntentions, createWeeklyIntention } from "@/services/intentionService";
import { getCurrentWeekStart } from "@/types/intentions";
import { IntentionForm } from "@/components/intentions/IntentionForm";
import { IntentionsLoadingState } from "@/components/intentions/LoadingState";
import { IntentionsErrorState } from "@/components/intentions/ErrorState";

const IntentionsEdit = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const userId = session?.user.id;
  const currentWeekStart = getCurrentWeekStart();

  // Fetch current intentions if editing
  const { data: intentions, isLoading, isError, error } = useQuery({
    queryKey: ["intention", id || "current", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
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

  // Set page title
  useEffect(() => {
    document.title = id ? "Edit Weekly Intentions | Daily Driver" : "Set Weekly Intentions | Daily Driver";
  }, [id]);

  if (isLoading) {
    return <IntentionsLoadingState />;
  }

  if (isError || !intentions) {
    console.error("Error loading intentions:", error);
    return <IntentionsErrorState />;
  }

  const isCurrentWeek = intentions.week_start === currentWeekStart;

  return (
    <div className="container py-6">
      <IntentionForm 
        intentions={intentions} 
        isCurrentWeek={isCurrentWeek} 
      />
    </div>
  );
};

export default IntentionsEdit;
