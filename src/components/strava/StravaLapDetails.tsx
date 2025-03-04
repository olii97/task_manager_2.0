
import { SavedStravaActivity } from "@/types/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";

interface StravaLapDetailsProps {
  activity: SavedStravaActivity;
}

export function StravaLapDetails({ activity }: StravaLapDetailsProps) {
  const hasHeartRate = activity.average_heartrate && activity.average_heartrate > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lap Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">Lap</th>
                <th className="py-2 text-left font-medium">Distance</th>
                <th className="py-2 text-left font-medium">Time</th>
                <th className="py-2 text-left font-medium">Pace</th>
                {hasHeartRate && (
                  <th className="py-2 text-left font-medium">HR</th>
                )}
              </tr>
            </thead>
            <tbody>
              {activity.laps?.map((lap, index) => (
                <tr key={lap.id} className="border-b last:border-0">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{formatDistance(lap.distance)}</td>
                  <td className="py-2">{formatTime(lap.moving_time)}</td>
                  <td className="py-2">{formatPace(lap.average_speed)}</td>
                  {hasHeartRate && (
                    <td className="py-2">
                      {lap.average_heartrate ? `${Math.round(lap.average_heartrate)} bpm` : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
