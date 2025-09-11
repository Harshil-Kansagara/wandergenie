import React from "react";
import { Trip, EnrichedActivity, Persona, ItineraryDay } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Calendar,
  Users,
  Heart,
  Share2,
  Map as MapIcon,
  AlertTriangle,
} from "lucide-react";
import { ActivityCard } from "./activity-card";
import CostBreakdown from "./cost-breakdown";
import WeatherWidget from "./weather-widget";
import MapComponent from "./map-component";
import { useCurrency } from "@/hooks/use-currency";

export const ItineraryDisplay: React.FC<{
  itinerary: Trip & { persona?: Persona };
}> = ({ itinerary }) => {
  const { formatCurrency } = useCurrency();

  return (
    <div className="itinerary-display relative">
      <header className="mb-12 text-center p-8 bg-card border rounded-lg">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          {itinerary.title}
        </h1>
        {itinerary.persona?.introduction && (
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            "{itinerary.persona.introduction}"
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
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
        {itinerary.costBreakdown?.isOverBudget && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 mr-3 text-destructive" />
                    <div className="text-sm text-destructive-foreground text-left">
                        <p className="font-semibold">This itinerary is approximately {itinerary.currency} {itinerary.costBreakdown.overageAmount.toFixed(0)} over your budget.</p>
                        <p className="text-xs">Consider swapping some activities for more budget-friendly options.</p>
                    </div>
                </div>
            </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {itinerary.itinerary?.days.map((day: ItineraryDay) => (
            <div key={day.day} className="day-plan mb-8">
              <h2 className="text-3xl font-bold mb-2 sticky top-16 bg-background/80 backdrop-blur-sm py-3 z-10 border-b">
                Day {day.day}: {day.module ?? ""}
              </h2>
              <p className="text-muted-foreground italic mb-6">
                "{day.narrative ?? ""}"
              </p>
              {day.activities?.map((activity: EnrichedActivity) => (
                <ActivityCard
                  key={`${day.day}-${activity.activityName}`}
                  activity={activity}
                  currency={itinerary.currency}
                />
              ))}
              <div className="mt-6 pt-4 border-t border-dashed">
                <div className="flex justify-end items-center">
                  <span className="text-lg font-semibold text-muted-foreground mr-4">Day Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(day.activities?.reduce((total, activity) => {
                        const cost = parseFloat(String(activity.approximateCost).replace(/[^0-9.-]+/g, ""));
                        return total + (isNaN(cost) ? 0 : cost);
                    }, 0) || 0, itinerary.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 self-start">
          <CostBreakdown
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapIcon className="h-5 w-5 mr-2 text-primary" />
                Route Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {/* MapComponent will need to be adapted to handle waypoints from enriched activities */}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};
