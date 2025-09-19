import React, { useEffect, useRef, useState } from "react";
import { Plus, Minus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Waypoint {
  location: string;
  latLng?: LatLng;
  rating?: number;
  cost?: string;
}

interface MapComponentProps {
  destination: { description: string; latLng?: LatLng };
  waypoints?: Waypoint[];
  onPinClick?: (index: number) => void;
  onPinMouseEnter?: (index: number) => void;
  onPinMouseLeave?: () => void;
  className?: string;
}

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const createTooltipElement = (waypoint: Waypoint) => {
  const element = document.createElement('div');
  element.className = "p-3 rounded-lg shadow-lg bg-white/70 backdrop-blur-md border border-gray-200/50";
  element.style.minWidth = '150px';

  let content = `<div class="font-bold text-sm text-gray-800">${waypoint.location}</div>`;
  if (waypoint.rating) {
    content += `<div class="flex items-center text-xs text-amber-600 mt-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${waypoint.rating}</div>`;
  }
  if (waypoint.cost) {
    content += `<div class="text-xs text-gray-600 mt-1">${waypoint.cost}</div>`;
  }
  element.innerHTML = content;
  return element;
};

class Tooltip extends google.maps.OverlayView {
  private readonly position: google.maps.LatLng;
  private readonly content: HTMLElement;

  constructor(position: google.maps.LatLng, content: HTMLElement) {
    super();
    this.position = position;
    this.content = content;
    this.content.style.position = 'absolute';
  }

  onAdd() {
    this.getPanes()!.floatPane.appendChild(this.content);
  }

  onRemove() {
    if (this.content.parentElement) {
      this.content.parentElement.removeChild(this.content);
    }
  }

  draw() {
    const divPosition = this.getProjection().fromLatLngToDivPixel(this.position)!;
    this.content.style.left = `${divPosition.x + 15}px`;
    this.content.style.top = `${divPosition.y - 15}px`;
  }
}

export default function MapComponent({ destination, waypoints = [], onPinClick, onPinMouseEnter, onPinMouseLeave, className }: Readonly<MapComponentProps>) {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const activeTooltip = useRef<Tooltip | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) {
        setTimeout(initMap, 100);
        return;
      }

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 10,
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID || undefined,
        mapTypeId: 'roadmap',
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: mapStyle,
      });

      polylineRef.current = new window.google.maps.Polyline({
        strokeColor: '#4F46E5',
        strokeOpacity: 0.8,
        strokeWeight: 4,
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
      updateMarkers();
    }
  }, [destination, waypoints, onPinClick, onPinMouseEnter, onPinMouseLeave]);

  const updateMarkers = () => {
    if (!mapInstance.current || !window.google?.maps?.marker) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    const polylinePath = waypoints
      .map(p => p.latLng && { lat: parseFloat(p.latLng.latitude as any), lng: parseFloat(p.latLng.longitude as any) })
      .filter(Boolean) as google.maps.LatLngLiteral[];

    polylineRef.current?.setPath(polylinePath);

    const allPoints = [...waypoints, destination];
    const bounds = new window.google.maps.LatLngBounds();

    allPoints.forEach((point, index) => {
      if (point.latLng && point.latLng.latitude && point.latLng.longitude) {
        const lat = parseFloat(point.latLng.latitude as any);
        const lng = parseFloat(point.latLng.longitude as any);

        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };
          const isWaypoint = 'location' in point && index < waypoints.length;

          // Create a custom pin element for waypoints
          const pin = new google.maps.marker.PinElement({
            scale: 1.2,
            glyphColor: 'white', 
            background: '#4F46E5',
            borderColor: '#ffffff',
            glyph: `${index + 1}`,
          });

          const marker = new AdvancedMarkerElement({
            position,
            map: mapInstance.current,
            title: ('location' in point ? point.location : point.description) || '',
            content: isWaypoint ? pin.element : undefined, // Use custom pin for waypoints
          });

          if (isWaypoint && onPinClick) {
            marker.addListener('click', () => {
              onPinClick(index);
            });
          }

          // Add hover listeners for tooltips
          marker.element.addEventListener('mouseenter', () => {
            if (isWaypoint && onPinMouseEnter) {
              onPinMouseEnter(index);
            }
            pin.scale = 1.5;
            
            activeTooltip.current?.setMap(null);
            const tooltipElement = createTooltipElement(point as Waypoint);
            activeTooltip.current = new Tooltip(new google.maps.LatLng(position), tooltipElement);
            activeTooltip.current.setMap(mapInstance.current);
          });

          marker.element.addEventListener('mouseleave', () => {
            if (isWaypoint && onPinMouseLeave) onPinMouseLeave();
            pin.scale = 1.2;
            activeTooltip.current?.setMap(null);
          });

          markersRef.current.push(marker);
          bounds.extend(position);
        }
      }
    });

    if (markersRef.current.length === 0 && waypoints.length > 0) {
      console.warn("Waypoints were provided, but no markers could be created. Check if lat/lng are valid numbers.");
    }

    if (markersRef.current.length > 0) {
      // Use panToBounds for a smoother animation
      mapInstance.current.panToBounds(bounds);
      // Add a slight delay to allow panning, then fit the bounds more precisely
      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.fitBounds(bounds);
      }, 500);
    }
  };

  const handleZoomIn = () => {
    if (!mapInstance.current) return;
    const currentZoom = mapInstance.current.getZoom() || 10;
    mapInstance.current.setZoom(Math.min(currentZoom + 1, 20));
  };
  const handleZoomOut = () => {
    if (!mapInstance.current) return;
    const currentZoom = mapInstance.current.getZoom() || 10;
    mapInstance.current.setZoom(Math.max(currentZoom - 1, 1));
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border flex">
        <button className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-l-md" onClick={handleZoomIn} data-testid="button-zoom-in">
            <Plus className="h-4 w-4" />
          </button>
        <div className="w-px bg-border my-1"></div>
        <button className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-r-md" onClick={handleZoomOut} data-testid="button-zoom-out">
            <Minus className="h-4 w-4" />
          </button>
      </div>
    </div>
  );
}
