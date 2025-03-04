import { useState, useEffect, useRef } from "react";
import { SavedStravaActivity } from "@/types/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StravaRouteMapProps {
  activity: SavedStravaActivity;
}

// We need to declare the mapboxgl module to use it
declare global {
  interface Window {
    L: any;
  }
}

export function StravaRouteMap({ activity }: StravaRouteMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const hasMap = activity.map && activity.map.summary_polyline;

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
          // Load polyline decoder
          const polylineUtilScript = document.createElement('script');
          polylineUtilScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet-polylinedecorator/1.6.0/leaflet.polylineDecorator.js';
          polylineUtilScript.onload = () => {
            initializeMap();
          };
          document.head.appendChild(polylineUtilScript);
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

      // Use Leaflet.js' polyline utilities directly
      const polylineUtil = window.L.Util.extend({}, window.L);
      if (!polylineUtil.PolylineUtil) {
        // Manually create a decode function if the PolylineUtil is not available
        polylineUtil.PolylineUtil = {
          decode: function(str, precision) {
            precision = precision || 5;
            var index = 0,
                lat = 0,
                lng = 0,
                coordinates = [],
                shift = 0,
                result = 0,
                byte = null,
                latitude_change,
                longitude_change,
                factor = Math.pow(10, precision);
            
            // Coordinates have variable length when encoded, so just keep
            // track of whether we've hit the end of the string. In each
            // loop iteration, a single coordinate is decoded.
            while (index < str.length) {
              // Reset shift, result, and byte
              byte = null;
              shift = 0;
              result = 0;
              
              do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
              } while (byte >= 0x20);
              
              latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
              
              shift = result = 0;
              
              do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
              } while (byte >= 0x20);
              
              longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
              
              lat += latitude_change;
              lng += longitude_change;
              
              coordinates.push([lat / factor, lng / factor]);
            }
            
            return coordinates;
          }
        };
      }

      // Decode the polyline
      let decodedCoords;
      try {
        if (polylineUtil.PolylineUtil && polylineUtil.PolylineUtil.decode) {
          decodedCoords = polylineUtil.PolylineUtil.decode(activity.map.summary_polyline);
        } else {
          console.error("PolylineUtil.decode is not available");
          return;
        }
      } catch (err) {
        console.error("Error decoding polyline:", err);
        return;
      }

      if (!decodedCoords || decodedCoords.length === 0) {
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

  if (!hasMap) return null;

  return (
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
  );
}
