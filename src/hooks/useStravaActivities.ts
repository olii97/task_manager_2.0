
import { useQuery } from "@tanstack/react-query";
import { getStravaActivities } from "@/services/strava";
import { StravaActivity } from "@/types/strava";

export const useStravaActivities = (userId: string | undefined) => {
  const { data: stravaActivities, isLoading } = useQuery({
    queryKey: ["strava-activities", userId, "recent"],
    queryFn: async () => {
      if (!userId) return [];
      const activities = await getStravaActivities(userId);
      return activities;
    },
    enabled: !!userId,
  });

  return { stravaActivities: stravaActivities || [], isLoading };
};
