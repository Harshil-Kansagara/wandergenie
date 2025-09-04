import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, MapIcon } from "lucide-react";
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
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) {
        setTimeout(initMap, 100);
        return;
      }

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: zoom,
        mapId: "9372e8953f7a4bc8edecb951",
        mapTypeId: 'roadmap',
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });

      polylineRef.current = new window.google.maps.Polyline({
        strokeColor: '#8B5CF6',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: mapInstance.current,
      });

      updateMarkers();
    };

    initMap();

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      markersRef.current.forEach(marker => marker.map = null);
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
    if (mapInstance.current) {
      updateMarkers();
    }
  }, [destination, waypoints]);

  const updateMarkers = () => {
    if (!mapInstance.current || !window.google.maps.marker) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    const allPoints = [...waypoints, destination];
    const bounds = new window.google.maps.LatLngBounds();

    allPoints.forEach(point => {
      if (point.latLng) {
        const lat = parseFloat(point.latLng.latitude as any);
        const lng = parseFloat(point.latLng.longitude as any);

        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };
          const marker = new AdvancedMarkerElement({
            position,
            map: mapInstance.current,
            title: 'location' in point ? point.location : point.description,
          });
          markersRef.current.push(marker);
          bounds.extend(position);
        }
      }
    });

    if (markersRef.current.length > 0) {
      mapInstance.current.fitBounds(bounds);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 1, 1));

  return (
    <div className={`bg-muted rounded-xl overflow-hidden ${className}`}>
      <div className="relative h-96">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute top-4 right-4 bg-card rounded-lg p-2 elevation-2">
          <div className="flex flex-col space-y-2">
            <Button size="sm" className="w-8 h-8 p-0" onClick={handleZoomIn} data-testid="button-zoom-in">
              <Plus className="h-3 w-3" />
            </Button>
            <Button size="sm" className="w-8 h-8 p-0" onClick={handleZoomOut} data-testid="button-zoom-out">
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-card">
        <div className="flex items-center space-x-4">
          <Button variant={'default'} size="sm" data-testid="button-map-view">
            <MapIcon className="h-4 w-4 mr-2" />
            {t('map')}
          </Button>
        </div>
      </div>
    </div>
  );
}
