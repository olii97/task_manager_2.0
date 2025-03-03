
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";
import { StravaActivity } from "@/types/strava";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Zap } from "lucide-react";

interface StravaActivityItemProps {
  activity: StravaActivity;
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
                {format(new Date(activity.start_date), "MMM d")}
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
          <div className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            {activity.type}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{activity.name}</h3>
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
            {format(new Date(activity.start_date), "MMM d, yyyy")}
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
        {activity.average_speed > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Avg Pace</p>
            <p className="text-sm font-medium">{formatPace(activity.average_speed)}</p>
          </div>
        )}
        {activity.total_elevation_gain > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Elevation</p>
            <p className="text-sm font-medium">{Math.round(activity.total_elevation_gain)}m</p>
          </div>
        )}
        {activity.average_heartrate > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Avg HR</p>
            <p className="text-sm font-medium">{Math.round(activity.average_heartrate)} bpm</p>
          </div>
        )}
      </div>
    </div>
  );
}
