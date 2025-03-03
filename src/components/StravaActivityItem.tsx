
import { StravaActivity } from "@/types/strava";
import { formatDate, formatDistance, formatTime } from "@/utils/formatters";

interface StravaActivityItemProps {
  activity: StravaActivity;
}

export function StravaActivityItem({ activity }: StravaActivityItemProps) {
  return (
    <div className="py-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{activity.name}</h3>
          <p className="text-sm text-muted-foreground">
            {activity.type} • {formatDate(activity.start_date_local)}
          </p>
        </div>
        <div className="text-right text-sm">
          <p>{formatDistance(activity.distance)}</p>
          <p className="text-muted-foreground">
            {formatTime(activity.moving_time)}
          </p>
        </div>
      </div>
    </div>
  );
}
