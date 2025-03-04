
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";
import { SavedStravaActivity } from "@/types/strava";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Zap, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StravaActivityItemProps {
  activity: SavedStravaActivity;
  compact?: boolean;
}

export function StravaActivityItem({ activity, compact = false }: StravaActivityItemProps) {
  if (compact) {
    return (
      <div className="py-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">{activity.name}</p>
            <div className="text-xs text-muted-foreground flex gap-2 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(activity.start_date_local), "MMM d")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(activity.moving_time)}
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {formatDistance(activity.distance)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activity.saved && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Save className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-800 border-0">
              {activity.type}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium">{activity.name}</h3>
            {activity.saved && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                <Save className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
          {activity.location_city && (
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1 inline" />
              {activity.location_city}
              {activity.location_state && `, ${activity.location_state}`}
            </p>
          )}
        </div>
        <div className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {activity.type}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-sm font-medium">
            {format(new Date(activity.start_date || activity.start_date_local), "MMM d, yyyy")}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Time</p>
          <p className="text-sm font-medium">{formatTime(activity.moving_time)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="text-sm font-medium">{formatDistance(activity.distance)}</p>
        </div>
        {activity.average_speed && activity.average_speed > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Avg Pace</p>
            <p className="text-sm font-medium">{formatPace(activity.average_speed)}</p>
          </div>
        )}
        {activity.total_elevation_gain && activity.total_elevation_gain > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Elevation</p>
            <p className="text-sm font-medium">{Math.round(activity.total_elevation_gain)}m</p>
          </div>
        )}
        {activity.average_heartrate && activity.average_heartrate > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Avg HR</p>
            <p className="text-sm font-medium">{Math.round(activity.average_heartrate)} bpm</p>
          </div>
        )}
      </div>
    </div>
  );
}
