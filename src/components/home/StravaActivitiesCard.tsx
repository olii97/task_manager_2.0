
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getStravaActivities } from "@/services/stravaService";
import { SavedStravaActivity } from "@/types/strava";
import { format } from "date-fns";

export interface StravaActivitiesCardProps {
  activities?: SavedStravaActivity[];
  isLoading?: boolean;
}

export function StravaActivitiesCard({ activities: propActivities, isLoading: propIsLoading }: StravaActivitiesCardProps = {}) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const userId = session?.user.id;

  // Only run the query if no activities are passed as props
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recentStravaActivities', userId],
    queryFn: () => getStravaActivities(userId || ''),
    enabled: !!userId && !propActivities,
  });

  const displayedActivities = propActivities || activities || [];
  const loading = propIsLoading !== undefined ? propIsLoading : isLoading;

  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Recent Activities</span>
          <Button variant="ghost" size="sm" onClick={() => navigate("/strava")}>
            View All →
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayedActivities.length > 0 ? (
          <div className="space-y-4">
            {displayedActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="border-b pb-3 last:border-0">
                <div className="font-medium">{activity.name}</div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>{activity.type}</span>
                  <span>{format(new Date(activity.start_date), "MMM dd")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activities</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/strava")}>
              Connect Strava
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
