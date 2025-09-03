import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Navigation, Satellite, MapIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

interface MapComponentProps {
  origin: string;
  destination: string;
  waypoints?: string[];
  className?: string;
}

export default function MapComponent({ origin, destination, waypoints = [], className }: MapComponentProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'roadmap' | 'satellite'>('roadmap');

  // Mock map implementation - in production, use Google Maps API
  const markers = [
    { id: 'origin', name: origin, color: 'bg-destructive', position: { top: '25%', left: '25%' } },
    { id: 'destination', name: destination, color: 'bg-secondary', position: { bottom: '33%', left: '50%' } },
    ...waypoints.map((waypoint, index) => ({
      id: `waypoint-${index}`,
      name: waypoint,
      color: 'bg-primary',
      position: { 
        top: `${30 + index * 20}%`, 
        right: `${30 + index * 10}%` 
      }
    }))
  ];

  return (
    <div className={`bg-muted rounded-xl overflow-hidden ${className}`}>
      {/* Map Display */}
      <div className="relative h-96 bg-gradient-to-br from-secondary/20 to-primary/20">
        {/* Background Map Image */}
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: viewMode === 'satellite' 
              ? `url('https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=800&h=400')`
              : `url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&h=400')`
          }}
        >
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 bg-card rounded-lg p-2 elevation-2">
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                className="w-8 h-8 p-0"
                data-testid="button-zoom-in"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                className="w-8 h-8 p-0"
                data-testid="button-zoom-out"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Location Markers */}
          {markers.map((marker) => (
            <div 
              key={marker.id}
              className={`absolute ${marker.color} text-white rounded-full w-6 h-6 flex items-center justify-center elevation-4 cursor-pointer hover:scale-110 smooth-transition`}
              style={marker.position}
              data-testid={`marker-${marker.id}`}
            >
              <MapIcon className="h-3 w-3" />
            </div>
          ))}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-card rounded-lg p-3 elevation-2 max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground truncate" data-testid="text-origin">{origin}</span>
              </div>
              {waypoints.map((waypoint, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground truncate">{waypoint}</span>
                </div>
              ))}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-muted-foreground truncate" data-testid="text-destination">{destination}</span>
              </div>
            </div>
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
        
        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
          <Navigation className="h-4 w-4" />
          <span data-testid="text-total-distance">
            {t('total_distance')}: {Math.floor(Math.random() * 1000 + 500)} km
          </span>
        </div>
      </div>
    </div>
  );
}
