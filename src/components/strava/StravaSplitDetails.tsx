
import { SavedStravaActivity } from "@/types/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";

interface StravaSplitDetailsProps {
  activity: SavedStravaActivity;
}

export function StravaSplitDetails({ activity }: StravaSplitDetailsProps) {
  const splits = activity.splits_metric || activity.splits_standard;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Split Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">Split</th>
                <th className="py-2 text-left font-medium">Distance</th>
                <th className="py-2 text-left font-medium">Time</th>
                <th className="py-2 text-left font-medium">Pace</th>
                <th className="py-2 text-left font-medium">Elevation</th>
              </tr>
            </thead>
            <tbody>
              {splits?.map((split, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{formatDistance(split.distance)}</td>
                  <td className="py-2">{formatTime(split.moving_time)}</td>
                  <td className="py-2">{formatPace(split.average_speed)}</td>
                  <td className="py-2">{split.elevation_difference}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
