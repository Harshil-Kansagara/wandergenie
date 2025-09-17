import React from "react";
import { Trip, Persona, ItineraryDay, EnrichedActivity } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Map as MapIcon,
  AlertTriangle,
  Wallet,
  List,
} from "lucide-react";
import { ActivityCard } from "./activity-card";
import CostBreakdown from "./cost-breakdown";
import WeatherWidget from "./weather-widget";
import MapComponent from "./map-component";
import { useCurrency } from "@/hooks/use-currency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ItineraryDisplay: React.FC<{
  itinerary: Trip & { persona?: Persona };
}> = ({ itinerary }) => {
  const { formatCurrency } = useCurrency();

  return (
    <div className="itinerary-display">
      {/* Header Section with Background Image */}
      <header className="relative h-64 md:h-80 rounded-b-3xl overflow-hidden mb-[-80px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://source.unsplash.com/1600x900/?${encodeURIComponent(
              itinerary.destination
            )})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8 text-white">
          <h1 className="text-3xl lg:text-5xl font-bold drop-shadow-lg">
            {itinerary.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm opacity-90">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {itinerary.startDate && itinerary.endDate && (
                <span>
                  {format(new Date(itinerary.startDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(itinerary.endDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{itinerary.groupSize ?? 1} traveler(s)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <div className="relative bg-card rounded-t-3xl p-4 md:p-6 z-10">
        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="itinerary">
              <List className="h-4 w-4 mr-2" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
            <TabsTrigger value="budget">
              <Wallet className="h-4 w-4 mr-2" />
              Budget
            </TabsTrigger>
          </TabsList>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            {itinerary.itinerary?.days.map((day: ItineraryDay) => (
              <div key={day.day} className="day-plan">
                <h2 className="text-2xl font-bold mb-2 sticky top-16 bg-card/80 backdrop-blur-sm py-3 z-10 border-b">
                  Day {day.day}: {day.module ?? ""}
                </h2>
                <p className="text-muted-foreground italic mb-4">
                  "{day.narrative ?? ""}"
                </p>
                {day.activities?.map((activity: EnrichedActivity) => (
                  <ActivityCard
                    key={`${day.day}-${activity.activityName}`}
                    activity={activity}
                    currency={itinerary.currency}
                  />
                ))}
              </div>
            ))}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card>
              <CardContent className="p-2 h-[600px]">
                {itinerary.destinationLatLng && (
                  <MapComponent
                    destination={{
                      description: itinerary.destination,
                      latLng: {
                        latitude: itinerary.destinationLatLng.lat,
                        longitude: itinerary.destinationLatLng.lng,
                      },
                    }}
                    waypoints={itinerary.itinerary?.days.flatMap((day) =>
                      day.activities
                        .filter((a) => a.location)
                        .map((a) => ({
                          location: a.activityName,
                          latLng: a.location,
                        }))
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            {itinerary.costBreakdown?.isOverBudget && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3 text-destructive" />
                  <div className="text-sm text-destructive-foreground">
                    <p className="font-semibold">
                      This itinerary is approximately{" "}
                      {formatCurrency(
                        itinerary.costBreakdown.overageAmount,
                        itinerary.currency
                      )}{" "}
                      over your budget.
                    </p>
                    <p className="text-xs">
                      Consider swapping some activities for more budget-friendly
                      options.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <CostBreakdown
              itinerary={itinerary}
              costBreakdown={itinerary.costBreakdown}
              totalCost={itinerary.costBreakdown?.total}
              currency={itinerary.currency}
            />
            {itinerary.destinationLatLng && (
              <WeatherWidget
                destination={itinerary.destination}
                latitude={itinerary.destinationLatLng.lat}
                longitude={itinerary.destinationLatLng.lng}
                date={itinerary.startDate}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
