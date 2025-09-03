import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Satellite, MapIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Waypoint {
  location: string;
  latLng?: LatLng;
}

interface MapComponentProps {
  destination: { description: string; latLng?: LatLng };
  waypoints?: Waypoint[];
  className?: string;
}

export default function MapComponent({ destination, waypoints = [], className }: MapComponentProps) {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(10);
  const [viewMode, setViewMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (window.google && mapRef.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 }, // Default center, will be updated by route
        zoom: zoom,
        mapTypeId: viewMode,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });

      polylineRef.current = new window.google.maps.Polyline({
        strokeColor: '#8B5CF6', // Primary color
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: mapInstance.current,
      });
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []); // Initialize map once

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setMapTypeId(viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    calculateAndDisplayRoute();
  }, [destination, waypoints]); // Recalculate route when destination or waypoints change

  const calculateAndDisplayRoute = async () => {
    if (!destination.latLng) {
      console.error("Destination coordinates are missing.");
      return;
    }

    const origin = waypoints.length > 0 && waypoints[0].latLng ? waypoints[0].latLng : destination.latLng;
    const destinationCoord = destination.latLng;

    const intermediateWaypoints = waypoints.slice(1).filter(wp => wp.latLng).map(wp => ({
      latLng: wp.latLng,
      stopover: true,
    }));

    try {
      const response = await fetch("/api/routes/directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: origin,
          destination: destinationCoord,
          waypoints: intermediateWaypoints,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const decodedPath = window.google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
        polylineRef.current?.setPath(decodedPath);

        if (mapInstance.current) {
          const bounds = new window.google.maps.LatLngBounds();
          decodedPath.forEach(point => bounds.extend(point));
          mapInstance.current.fitBounds(bounds);
        }
      } else {
        console.warn("No routes found.");
      }

    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className={`bg-muted rounded-xl overflow-hidden ${className}`}>
      <div className="relative h-96">
        <div ref={mapRef} className="w-full h-full" />

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 bg-card rounded-lg p-2 elevation-2">
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleZoomIn}
              data-testid="button-zoom-in"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleZoomOut}
              data-testid="button-zoom-out"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="flex items-center justify-between p-4 bg-card">
        <div className="flex items-center space-x-4">
          <Button
            variant={viewMode === 'satellite' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('satellite')}
            data-testid="button-satellite-view"
          >
            <Satellite className="h-4 w-4 mr-2" />
            {t('satellite')}
          </Button>
          <Button
            variant={viewMode === 'roadmap' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('roadmap')}
            data-testid="button-map-view"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {t('map')}
          </Button>
        </div>
      </div>
    </div>
  );
}
