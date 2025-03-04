
import { SavedStravaActivity } from "@/types/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StravaPerformanceMetricsProps {
  activity: SavedStravaActivity;
}

export function StravaPerformanceMetrics({ activity }: StravaPerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activity.max_speed && (
            <div>
              <p className="text-sm text-muted-foreground">Max Pace</p>
              <p className="font-medium">{formatPace(activity.max_speed)}</p>
            </div>
          )}
          
          {activity.average_heartrate && (
            <div>
              <p className="text-sm text-muted-foreground">Avg Heart Rate</p>
              <p className="font-medium">{Math.round(activity.average_heartrate)} bpm</p>
            </div>
          )}
          
          {activity.max_heartrate && (
            <div>
              <p className="text-sm text-muted-foreground">Max Heart Rate</p>
              <p className="font-medium">{Math.round(activity.max_heartrate)} bpm</p>
            </div>
          )}
          
          {activity.total_elevation_gain && (
            <div>
              <p className="text-sm text-muted-foreground">Elevation Gain</p>
              <p className="font-medium">{Math.round(activity.total_elevation_gain)}m</p>
            </div>
          )}
          
          {activity.average_cadence && (
            <div>
              <p className="text-sm text-muted-foreground">Average Cadence</p>
              <p className="font-medium">{Math.round(activity.average_cadence)} rpm</p>
            </div>
          )}
          
          {activity.average_watts && (
            <div>
              <p className="text-sm text-muted-foreground">Average Power</p>
              <p className="font-medium">{Math.round(activity.average_watts)} W</p>
            </div>
          )}
          
          {activity.average_watts_weighted && (
            <div>
              <p className="text-sm text-muted-foreground">Weighted Avg Power</p>
              <p className="font-medium">{Math.round(activity.average_watts_weighted)} W</p>
            </div>
          )}
          
          {activity.kilojoules && (
            <div>
              <p className="text-sm text-muted-foreground">Energy Output</p>
              <p className="font-medium">{Math.round(activity.kilojoules)} kJ</p>
            </div>
          )}
          
          {activity.calories && (
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-medium">{Math.round(activity.calories)} kcal</p>
            </div>
          )}
          
          {activity.average_temp && (
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="font-medium">{Math.round(activity.average_temp)}°C</p>
            </div>
          )}
          
          {activity.elevation_high && (
            <div>
              <p className="text-sm text-muted-foreground">Max Elevation</p>
              <p className="font-medium">{Math.round(activity.elevation_high)}m</p>
            </div>
          )}
          
          {activity.elevation_low && (
            <div>
              <p className="text-sm text-muted-foreground">Min Elevation</p>
              <p className="font-medium">{Math.round(activity.elevation_low)}m</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Import the formatter function
import { formatPace } from "@/utils/formatters";
