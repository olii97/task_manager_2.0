
import { SavedStravaActivity } from "@/types/strava";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StravaActivityHeader } from "./strava/StravaActivityHeader";
import { StravaActivitySummary } from "./strava/StravaActivitySummary";
import { StravaRouteMap } from "./strava/StravaRouteMap";
import { StravaPerformanceMetrics } from "./strava/StravaPerformanceMetrics";
import { StravaLapDetails } from "./strava/StravaLapDetails";
import { StravaSplitDetails } from "./strava/StravaSplitDetails";
import { StravaSegments } from "./strava/StravaSegments";

interface StravaActivityDetailsProps {
  activity: SavedStravaActivity;
  onBack: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function StravaActivityDetails({ 
  activity, 
  onBack,
  onSave,
  isSaved = false
}: StravaActivityDetailsProps) {
  const hasLaps = activity.laps && activity.laps.length > 0;
  const hasSplits = (activity.splits_metric && activity.splits_metric.length > 0) || 
                  (activity.splits_standard && activity.splits_standard.length > 0);
  const hasMap = activity.map && activity.map.summary_polyline;
  const hasSegments = activity.segment_efforts && activity.segment_efforts.length > 0;

  // Automatically open the first tab with data
  const defaultTab = hasLaps ? "laps" : hasSplits ? "splits" : "details";

  return (
    <div className="space-y-6">
      <StravaActivityHeader 
        activity={activity} 
        onBack={onBack} 
        onSave={onSave} 
        isSaved={isSaved} 
      />
      
      <StravaActivitySummary activity={activity} />

      {hasMap && <StravaRouteMap activity={activity} />}

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          {hasLaps && <TabsTrigger value="laps" className="flex-1">Laps</TabsTrigger>}
          {hasSplits && <TabsTrigger value="splits" className="flex-1">Splits</TabsTrigger>}
          {hasSegments && <TabsTrigger value="segments" className="flex-1">Segments</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details">
          <StravaPerformanceMetrics activity={activity} />
        </TabsContent>
        
        {hasLaps && (
          <TabsContent value="laps">
            <StravaLapDetails activity={activity} />
          </TabsContent>
        )}
        
        {hasSplits && (
          <TabsContent value="splits">
            <StravaSplitDetails activity={activity} />
          </TabsContent>
        )}
        
        {hasSegments && (
          <TabsContent value="segments">
            <StravaSegments activity={activity} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
