
import { useQuery } from "@tanstack/react-query";
import { fetchStravaActivities } from "@/services/stravaService";

export const useStravaActivities = (userId: string | undefined) => {
  const { data: stravaActivities, isLoading } = useQuery({
    queryKey: ["strava-activities", userId, "recent"],
    queryFn: async () => {
      if (!userId) return [];
      const { activities, error } = await fetchStravaActivities(userId);
      if (error) {
        console.error("Error fetching Strava activities:", error);
        return [];
      }
      return activities.slice(0, 5); // Get only the 5 most recent activities
    },
    enabled: !!userId,
  });

  return { stravaActivities, isLoading };
};
