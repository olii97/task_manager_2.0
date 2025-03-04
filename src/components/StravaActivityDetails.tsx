
import { formatDistance, formatPace, formatTime } from "@/utils/formatters";
import { StravaActivity, StravaLap, StravaSplit, SavedStravaActivity } from "@/types/strava";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Zap, ArrowLeft, ChevronDown, ChevronUp, Save, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StravaActivityDetailsProps {
  activity: SavedStravaActivity;
  onBack: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

// We need to declare the mapboxgl module to use it
declare global {
  interface Window {
    L: any;
  }
}

export function StravaActivityDetails({ 
  activity, 
  onBack,
  onSave,
  isSaved = false
}: StravaActivityDetailsProps) {
  const [showLaps, setShowLaps] = useState(false);
  const [showSplits, setShowSplits] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const toggleLaps = () => setShowLaps(!showLaps);
  const toggleSplits = () => setShowSplits(!showSplits);
  
  const hasLaps = activity.laps && activity.laps.length > 0;
  const hasSplits = (activity.splits_metric && activity.splits_metric.length > 0) || 
                    (activity.splits_standard && activity.splits_standard.length > 0);
  const hasMap = activity.map && activity.map.summary_polyline;
  const hasHeartRate = activity.average_heartrate && activity.average_heartrate > 0;
  const hasPRs = activity.pr_count && activity.pr_count > 0;
  const hasSegments = activity.segment_efforts && activity.segment_efforts.length > 0;

  // Automatically open the first tab with data
  const defaultTab = hasLaps ? "laps" : hasSplits ? "splits" : "details";

  // Load Leaflet Map
  useEffect(() => {
    if (!hasMap || mapLoaded || !mapRef.current) return;

    // Function to load Leaflet scripts and CSS
    const loadLeaflet = async () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap();
        return;
      }

      // Load Leaflet CSS
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkEl);

      // Load Leaflet JS
      const scriptEl = document.createElement('script');
      scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptEl.onload = () => {
        // Load Leaflet Encoded Polyline
        const polylineScript = document.createElement('script');
        polylineScript.src = 'https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js';
        polylineScript.onload = () => {
          initializeMap();
        };
        document.head.appendChild(polylineScript);
      };
      document.head.appendChild(scriptEl);
    };

    loadLeaflet();
  }, [hasMap, mapLoaded, activity]);

  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !window.L || !activity.map?.summary_polyline) return;

    try {
      // Clear any existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create a new map
      const map = window.L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      });
      
      mapInstanceRef.current = map;

      // Add the OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Decode the polyline
      const decodedCoords = window.L.Polyline.fromEncoded(activity.map.summary_polyline).getLatLngs();

      if (decodedCoords.length === 0) {
        console.error("No coordinates in polyline");
        return;
      }

      // Create a polyline and add it to the map
      const polyline = window.L.polyline(decodedCoords, {
        color: '#1e88e5',
        weight: 5,
        opacity: 0.8
      }).addTo(map);

      // Add start and end markers if available
      if (decodedCoords.length > 0) {
        // Add a custom start marker
        const startIcon = window.L.icon({
          iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41]
        });

        window.L.marker(decodedCoords[0], { icon: startIcon })
          .addTo(map)
          .bindPopup('Start');

        // Add an end marker if different from start
        const lastCoord = decodedCoords[decodedCoords.length - 1];
        if (lastCoord.lat !== decodedCoords[0].lat || lastCoord.lng !== decodedCoords[0].lng) {
          window.L.marker(lastCoord, { icon: startIcon })
            .addTo(map)
            .bindPopup('Finish');
        }
      }

      // Fit the map to the polyline bounds
      map.fitBounds(polyline.getBounds(), {
        padding: [30, 30]
      });

      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">{activity.name}</h2>
        </div>
        
        {onSave && (
          <Button 
            variant={isSaved ? "destructive" : "default"}
            size="sm"
            onClick={onSave}
          >
            {isSaved ? (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Activity
              </>
            )}
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activity Type</p>
                <p className="font-medium">{activity.type}</p>
              </div>
              
              {hasPRs && (
                <Badge className="bg-orange-500">
                  {activity.pr_count} Personal Record{activity.pr_count! > 1 ? 's' : ''}
                </Badge>
              )}
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

      {hasMap && (
        <Card>
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="h-64 md:h-96 rounded-md border overflow-hidden bg-gray-100"
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          {hasLaps && <TabsTrigger value="laps" className="flex-1">Laps</TabsTrigger>}
          {hasSplits && <TabsTrigger value="splits" className="flex-1">Splits</TabsTrigger>}
          {hasSegments && <TabsTrigger value="segments" className="flex-1">Segments</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details">
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
        </TabsContent>
        
        {hasLaps && (
          <TabsContent value="laps">
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
          </TabsContent>
        )}
        
        {hasSplits && (
          <TabsContent value="splits">
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
            </Card>
          </TabsContent>
        )}
        
        {hasSegments && (
          <TabsContent value="segments">
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
