import React from 'react';
import { SavedStravaActivity } from '@/types/strava';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart } from 'lucide-react';

interface HeartRateZone {
  min: number;
  max: number;
  time: number;
  percent: number;
}

interface StravaHeartRateProps {
  activity: SavedStravaActivity;
  zones?: HeartRateZone[];
}

const zoneColors = {
  1: 'bg-blue-500',    // Recovery
  2: 'bg-green-500',   // Endurance
  3: 'bg-yellow-500',  // Tempo
  4: 'bg-orange-500',  // Threshold
  5: 'bg-red-500'      // Maximum
};

export const StravaHeartRate: React.FC<StravaHeartRateProps> = ({ activity, zones }) => {
  if (!activity.has_heartrate) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          No heart rate data available for this activity
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Heart Rate Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-medium">Average Heart Rate</div>
              <div className="text-2xl font-bold">{Math.round(activity.average_heartrate)} bpm</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" fill="currentColor" />
            <div>
              <div className="text-sm font-medium">Max Heart Rate</div>
              <div className="text-2xl font-bold">{Math.round(activity.max_heartrate)} bpm</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Heart Rate Zones */}
      {zones && zones.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Heart Rate Zones</h3>
          <div className="space-y-4">
            {zones.map((zone, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Zone {index + 1} ({zone.min}-{zone.max} bpm)
                  </span>
                  <span>{Math.round(zone.time / 60)} min</span>
                </div>
                <Progress 
                  value={zone.percent} 
                  className={`h-2 ${zoneColors[index + 1 as keyof typeof zoneColors]}`}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {zone.percent.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}; 