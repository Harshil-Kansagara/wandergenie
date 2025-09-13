import React, { useState, useCallback } from "react";
import { Trip, Persona, ItineraryDay} from "@shared/schema";
import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";
import MapComponent from "./map-component";
import { motion, AnimatePresence } from "framer-motion";
import { DaySection } from "./day-section";
import { CostBreakdownPanel } from "./cost-breakdown-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CostBreakdownFAB } from "./cost-breakdown-fab";

export const ItineraryDisplay: React.FC<{
  itinerary: Trip & { persona?: Persona };
}> = ({ itinerary }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [isCostPanelOpen, setIsCostPanelOpen] = useState(false);
  const [hoveredActivityIndex, setHoveredActivityIndex] = useState<number | null>(null);

  const handleDayChange = (dayString: string) => {
    setActiveDay(parseInt(dayString, 10));
  };

  const handlePinClick = useCallback((activityIndex: number) => {
    const elementId = `day-${activeDay}-activity-${activityIndex}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeDay]);

  const handlePinMouseEnter = useCallback((index: number) => {
    setHoveredActivityIndex(index);
  }, []);

  const handlePinMouseLeave = useCallback(() => {
    setHoveredActivityIndex(null);
  }, []);

  const waypointsForActiveDay = React.useMemo(() => {
    return itinerary.itinerary?.days[activeDay - 1]?.activities
      .filter((a) => a.location)
      .map((a) => ({
        location: a.activityName,
        latLng: a.location,
        rating: a.rating,
      })) || [];
  }, [activeDay, itinerary.itinerary?.days]);

  return (
    <>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <header className="p-4 border-b bg-card text-center">
          <h1 className="text-2xl font-bold text-center">{itinerary.title}</h1>
          <div className="flex items-center justify-center space-x-4 text-muted-foreground mt-2">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(itinerary.startDate), "MMM d")} - {format(new Date(itinerary.endDate), "d, yyyy")}
            </span>
            <span className="flex items-center"><Users className="h-4 w-4 mr-2" />{itinerary.groupSize ?? 1} traveler(s)</span>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow overflow-hidden bg-muted/20">
        {/* Left Column: Interactive Map */}
          <div className="hidden lg:block relative h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              {itinerary.destinationLatLng && (
                <MapComponent
                  destination={{
                    description: itinerary.destination,
                    latLng: {
                      latitude: itinerary.destinationLatLng.lat,
                      longitude: itinerary.destinationLatLng.lng,
                    },
                  }}
                  waypoints={waypointsForActiveDay}
                  onPinClick={handlePinClick}
                  onPinMouseEnter={handlePinMouseEnter}
                  onPinMouseLeave={handlePinMouseLeave}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
  
        {/* Right Column: Itinerary */}
          <div className="bg-card flex flex-col h-full overflow-hidden relative" style={{ height: 'calc(100vh - 73px)' }}>
            <Tabs defaultValue="1" onValueChange={handleDayChange} className="flex-grow flex flex-col">
            <div className="p-4 border-b">
              <TabsList>
                {itinerary.itinerary?.days.map((day: ItineraryDay) => (
                  <TabsTrigger key={day.day} value={String(day.day)}>Day {day.day}</TabsTrigger>
                ))}
              </TabsList>
            </div>
              <div className="flex-grow overflow-hidden">
              {itinerary.itinerary?.days.map((day: ItineraryDay) => (
                <TabsContent key={day.day} value={String(day.day)} className="p-4 md:p-6 mt-0 h-full">
                  <DaySection
                    day={day}
                    persona={itinerary.persona}
                    currency={itinerary.currency}
                    hoveredActivityIndex={hoveredActivityIndex}
                  />
                </TabsContent>
              ))}
            </div>
          </Tabs>
            <CostBreakdownFAB onClick={() => setIsCostPanelOpen(true)} currency={itinerary.currency} />
        </div>
        </div>
      </div>
      <CostBreakdownPanel isOpen={isCostPanelOpen} onClose={() => setIsCostPanelOpen(false)} itinerary={itinerary} />
    </>
  );
};
