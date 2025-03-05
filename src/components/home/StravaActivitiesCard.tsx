
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StravaActivityList } from "@/components/StravaActivityList";
import { StravaActivity } from "@/types/strava";
import { toSavedStravaActivity } from "@/types/strava";

interface StravaActivitiesCardProps {
  activities: StravaActivity[];
  isLoading: boolean;
}

export const StravaActivitiesCard = ({ activities, isLoading }: StravaActivitiesCardProps) => {
  // Convert StravaActivity[] to SavedStravaActivity[] using the utility function
  const savedActivities = activities.map(activity => toSavedStravaActivity(activity));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Strava Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <StravaActivityList 
          activities={savedActivities || []} 
          isLoading={isLoading}
          compact={true}
        />
        {activities && activities.length > 0 && (
          <div className="mt-4 text-right">
            <Button asChild variant="outline" size="sm">
              <Link to="/strava">View All Activities</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
