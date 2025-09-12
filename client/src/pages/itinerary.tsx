import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Users, DollarSign, Clock, MapIcon, Share2 } from "lucide-react";
import ItineraryCard from "@/components/itinerary-card";
import MapComponent from "@/components/map-component";
import CostBreakdown from "@/components/cost-breakdown";
import WeatherWidget from "@/components/weather-widget";
import BookingFlow from "@/components/booking-flow";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth.tsx";
import { Trip } from "@shared/schema";
import { ApiError } from "@/lib/api-error.ts";
import { ApiResponse } from "../lib/api-response.ts";
import { ApiClient } from "@/lib/api-client.ts";

interface LatLng {
  latitude: number;
  longitude: number;
}

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

function fetchTripDetails(userId: string | undefined, tripId: string | undefined): Promise<ApiResponse<Trip>> {
  if (!userId || !tripId) {
    throw new Error("User ID and Trip ID are required");
  }
  return apiClient.get(`/api/trips/${userId}/${tripId}`);
}

export default function Itinerary() {
  const [match, params] = useRoute("/itinerary/:id");
  const id = params?.id;
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  
  const { data: apiResponse, isLoading, error } = useQuery<ApiResponse<Trip>, ApiError>({
    queryKey: ["trip", id, user?.uid],
    queryFn: () => fetchTripDetails(user?.uid || 'anonymous', id),
    enabled: !!id && !authLoading,
    retry: false, // Optional: prevent react-query from retrying on 4xx/5xx errors
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    let errorMessage = t('trip_not_found'); // Default error message
    if (error instanceof ApiError) {
      if (error.status !== 404) {
        // For non-404 errors, show a more generic message, possibly from the API
        errorMessage = error.body?.message || "An unexpected error occurred.";
      }
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{errorMessage}</p>
            <Link href="/">
              <Button className="mt-4">{t('back_to_home')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trip = apiResponse?.data;
  if (!trip) {
    // This case handles when the query is successful but returns no data.
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t('trip_not_found')}</p>
            <Link href="/"><Button className="mt-4">{t('back_to_home')}</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itinerary = trip?.itinerary || { days: [] };
  const destinationDescription = trip.destination;
  const destinationLatLng = trip.destinationLatLng;

  const mapWaypoints = itinerary.days.flatMap((day: any) => {
    const dayLocations: { location: string; latLng?: LatLng }[] = [];
    if (day.location && day.locationLatLng) {
      dayLocations.push({ location: day.location, latLng: day.locationLatLng });
    }
    day.activities?.forEach((activity: any) => {
      if (activity.location && activity.locationLatLng) {
        dayLocations.push({ location: activity.location, latLng: activity.locationLatLng });
      }
    });
    if (day.accommodation?.location && day.accommodation.locationLatLng) {
      dayLocations.push({ location: day.accommodation.location, latLng: day.accommodation.locationLatLng });
    }
    return dayLocations;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50 elevation-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back')}
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="button-share-trip">
                <Share2 className="h-4 w-4 mr-2" />
                {t('share')}
              </Button>
            </div>
          </div>
        </div>
      </header>
 
      {/* <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2" data-testid="text-trip-title">
              {itinerary.title || `Trip to ${destinationDescription}`}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('personalized_itinerary_description')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span data-testid="text-trip-dates">{trip.startDate} - {trip.endDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span data-testid="text-group-size">{trip.groupSize} {t('travelers')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span data-testid="text-trip-budget">{trip.currency} {trip.budget}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span data-testid="text-trip-duration">{itinerary.duration || 'N/A'} {t('days')}</span>
            </div>
          </div>
        </div>
      </section> */}

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {itinerary.days && itinerary.days.length > 0 ? (
              itinerary.days.map((day: any, index: number) => (
                <ItineraryCard key={index} day={day} dayNumber={index + 1} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t('no_itinerary_generated')}</p>
              </Card>
            )}
            <Button variant="outline" className="w-full border-dashed" data-testid="button-expand-itinerary">
              {t('view_complete_itinerary')}
            </Button>
          </div>
          <div className="space-y-6 sticky top-20">
            {destinationLatLng && (
              <WeatherWidget 
                destination={destinationDescription}
                latitude={destinationLatLng.latitude}
                longitude={destinationLatLng.longitude}
                date={trip.startDate}
              />
            )}
            <CostBreakdown 
              costBreakdown={itinerary.costBreakdown}
              totalCost={itinerary.totalCost}
              currency={trip.currency}
            />
          </div>
        </div>

        <Card className="elevation-2 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MapIcon className="h-5 w-5 mr-2 text-primary" />
              {t('route_map')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {destinationLatLng && (
              <MapComponent 
                destination={{ description: destinationDescription, latLng: destinationLatLng }}
                waypoints={mapWaypoints}
              />
            )}
          </CardContent>
        </Card>

        <Separator className="my-12" />
        <BookingFlow trip={trip} />
      </div> */}
    </div>
  );
}
