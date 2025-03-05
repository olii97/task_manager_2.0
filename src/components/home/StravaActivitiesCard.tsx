
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StravaActivityList } from "@/components/StravaActivityList";
import { StravaActivity, SavedStravaActivity, toSavedStravaActivity } from "@/types/strava";
import { Info } from "lucide-react";

interface StravaActivitiesCardProps {
  activities: StravaActivity[];
  isLoading: boolean;
}

export const StravaActivitiesCard = ({ activities, isLoading }: StravaActivitiesCardProps) => {
  // Convert StravaActivity[] to SavedStravaActivity[] for compatibility with StravaActivityList
  const savedActivities: SavedStravaActivity[] = activities.map(activity => 
    toSavedStravaActivity(activity, activity['saved'] as boolean || false)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Strava Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <StravaActivityList 
          activities={savedActivities} 
          isLoading={isLoading}
          compact={true}
        />
        {activities && activities.length > 0 ? (
          <div className="mt-4 text-right">
            <Button asChild variant="outline" size="sm">
              <Link to="/strava">View All Activities</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
            <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Activities need to be saved to your account to appear in your daily wrap-up. 
              Visit the <Link to="/strava" className="text-blue-600 underline">Strava page</Link> to save activities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
