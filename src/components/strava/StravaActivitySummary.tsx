
import { SavedStravaActivity } from "@/types/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

interface StravaActivitySummaryProps {
  activity: SavedStravaActivity;
}

export function StravaActivitySummary({ activity }: StravaActivitySummaryProps) {
  const hasPRs = activity.pr_count && activity.pr_count > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activity Type</p>
              <p className="font-medium">{activity.type}</p>
            </div>
            
            {hasPRs && (
              <Badge className="bg-orange-500">
                {activity.pr_count} Personal Record{activity.pr_count! > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(activity.start_date_local), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{formatTime(activity.moving_time)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-medium">{formatDistance(activity.distance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Pace</p>
              <p className="font-medium">{formatPace(activity.average_speed)}</p>
            </div>
          </div>
          
          {activity.location_city && (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium flex items-center">
                <MapPin className="h-3 w-3 mr-1 inline" />
                {activity.location_city}
                {activity.location_state && `, ${activity.location_state}`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
