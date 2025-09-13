import React, { useMemo } from "react";
import { EnrichedActivity } from "@shared/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  Star,
  Footprints,
  BookOpen,
  Navigation,
} from "lucide-react";
import { Button } from "./ui/button";
import { useCurrency } from "@/hooks/use-currency";

const getPlacePhotoUrl = (photoName: string) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&key=${GOOGLE_MAPS_API_KEY}`;
};

export const ActivityCard: React.FC<{ activity: EnrichedActivity, currency: string, id: string, isHovered: boolean }> = React.memo(({
  activity,
  currency,
  id,
  isHovered,
}) => {
  const { formatCurrency } = useCurrency();

  const directionsUrl = useMemo(() => {
    const base = "https://www.google.com/maps/search/?api=1";
    const query = activity.location
      ? `${activity.location.latitude},${activity.location.longitude}`
      : encodeURIComponent(`${activity.activityName}, ${activity.formattedAddress ?? ''}`);
    const placeId = activity.id ? `&query_place_id=${activity.id}` : '';
    return `${base}&query=${query}${placeId}`;
  }, [activity.location, activity.id, activity.activityName, activity.formattedAddress]);

  return (
    <Card id={id} className={`mb-6 overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg scroll-mt-24 ${isHovered ? 'border-primary shadow-primary/20' : ''}`}>
      <div className="grid md:grid-cols-3">
        {activity.photos && activity.photos.length > 0 ? (
          <Carousel className="md:col-span-1 group">
            <CarouselContent>
              {activity.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <img
                    src={getPlacePhotoUrl(photo.name)}
                    alt={`${activity.activityName} ${index + 1}`}
                    className="h-48 w-full object-cover md:h-full"
                    loading="lazy"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CarouselNext className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Carousel>
        ) : (
          <div className="md:col-span-1 bg-muted flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between p-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {activity.timeOfDay}
              </Badge>
              <CardTitle className="text-xl">{activity.activityName}</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground flex items-center pt-1">
              <Clock className="mr-1 h-4 w-4" />
              {activity.suggestedDuration}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <p className="text-muted-foreground mb-4">{activity.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
              {activity.formattedAddress && <div className="flex items-center"><MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> {activity.formattedAddress}</div>}
              {activity.approximateCost && (
                <div className="flex items-center">{formatCurrency(parseFloat(String(activity.approximateCost).replace(/[^0-9.-]+/g, "")), currency)}</div>
              )}
              {activity.rating && <div className="flex items-center"><Star className="mr-2 h-3.5 w-3.5 text-amber-500" /> {activity.rating} ({activity.userRatingsTotal ?? 0} reviews)</div>}
            </div>
          </CardContent>
        </div>
      </div>
      {activity.travelToNext && (
        <div className="bg-muted/50 px-4 py-2 border-t flex items-center text-xs text-muted-foreground italic">
          <Footprints className="mr-2 h-3.5 w-3.5 text-primary" />
          <span>
            Travel to next activity: ~
            {Math.round(parseInt(activity.travelToNext?.duration ?? '0') / 60)} min (
            {((activity.travelToNext?.distanceMeters ?? 0) / 1000).toFixed(1)} km)
          </span>
        </div>
      )}
    </Card>
  );
});
