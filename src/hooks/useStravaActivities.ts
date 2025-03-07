
import { useQuery } from "@tanstack/react-query";
import { getStravaActivities } from "@/services/strava";

export const useStravaActivities = (userId: string | undefined) => {
  const { data: stravaActivities, isLoading } = useQuery({
    queryKey: ["strava-activities", userId, "recent"],
    queryFn: async () => {
      if (!userId) return [];
      return await getStravaActivities(userId);
    },
    enabled: !!userId,
  });

  return { stravaActivities: stravaActivities || [], isLoading };
};
