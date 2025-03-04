
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";
import { StravaActivity, StravaLap } from "@/types/strava";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Zap, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface StravaActivityDetailsProps {
  activity: StravaActivity;
}

export function StravaActivityDetails({ activity }: StravaActivityDetailsProps) {
  const [showLaps, setShowLaps] = useState(false);
  const [showSplits, setShowSplits] = useState(false);
  const navigate = useNavigate();

  const toggleLaps = () => setShowLaps(!showLaps);
  const toggleSplits = () => setShowSplits(!showSplits);
  
  const hasLaps = activity.laps && activity.laps.length > 0;
  const hasSplits = (activity.splits_metric && activity.splits_metric.length > 0) || 
                    (activity.splits_standard && activity.splits_standard.length > 0);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">{activity.name}</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Activity Type</p>
              <p className="font-medium">{activity.type}</p>
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

      {/* Additional metrics */}
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
          </div>
        </CardContent>
      </Card>

      {/* Laps section */}
      {hasLaps && (
        <Card>
          <CardHeader className="pb-0">
            <Button 
              variant="ghost" 
              onClick={toggleLaps} 
              className="p-0 h-auto w-full flex justify-between items-center"
            >
              <CardTitle>Laps</CardTitle>
              {showLaps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardHeader>
          {showLaps && (
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Lap</th>
                      <th className="py-2 text-left font-medium">Distance</th>
                      <th className="py-2 text-left font-medium">Time</th>
                      <th className="py-2 text-left font-medium">Pace</th>
                      {activity.laps?.some(lap => lap.average_heartrate) && (
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
                        {activity.laps?.some(lap => lap.average_heartrate) && (
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
          )}
        </Card>
      )}

      {/* Splits section */}
      {hasSplits && (
        <Card>
          <CardHeader className="pb-0">
            <Button 
              variant="ghost" 
              onClick={toggleSplits} 
              className="p-0 h-auto w-full flex justify-between items-center"
            >
              <CardTitle>Splits</CardTitle>
              {showSplits ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardHeader>
          {showSplits && (
            <CardContent className="pt-4">
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
                    {(activity.splits_metric || activity.splits_standard)?.map((split, index) => (
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
          )}
        </Card>
      )}
    </div>
  );
}
