
import { SavedStravaActivity } from "@/types/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatTime } from "@/utils/formatters";
import { format } from "date-fns";

interface StravaSegmentsProps {
  activity: SavedStravaActivity;
}

export function StravaSegments({ activity }: StravaSegmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segments & Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.segment_efforts?.map((segment) => (
            <div key={segment.id} className="border-b pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{segment.name}</h3>
                {segment.is_kom && (
                  <Badge className="bg-yellow-500">KOM/QOM</Badge>
                )}
              </div>
              <div className="grid grid-cols-3 mt-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p>{formatDistance(segment.distance)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p>{formatTime(segment.elapsed_time)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{format(new Date(segment.start_date_local), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
