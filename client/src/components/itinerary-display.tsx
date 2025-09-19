import React, { useState, useCallback } from 'react';
import { Itinerary, Persona, ItineraryDay} from "@shared/schema";
import { format } from "date-fns";
import { Calendar, Users, Heart, Share2 } from "lucide-react";
import MapComponent from "./map-component";
import { motion, AnimatePresence } from "framer-motion";
import { DaySection } from "./day-section";
import { CostBreakdownPanel } from "./cost-breakdown-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CostBreakdownButton } from "./cost-breakdown-button";
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { t } from "@/lib/translation";


export const ItineraryDisplay: React.FC<{
  itinerary: Itinerary & { persona?: Persona };
}> = ({ itinerary, }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [isCostPanelOpen, setIsCostPanelOpen] = useState(false);
  const [hoveredActivityIndex, setHoveredActivityIndex] = useState<number | null>(null);
  const { user, setIsSignInOpen, saveItineraryTemporarily } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // TODO: update itinerary (linked to userId)
  const saveItineraryMutation = useMutation({
    mutationFn: (itinerary: Itinerary) => apiRequest('POST', '/api/itineraries', itinerary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: "Itinerary linked with user successfully!",
        description: "Your adventure is waiting for you in 'My Itineraries'.",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save your itinerary. Please try again.", variant: "destructive" });
    }
  });

  const handleShareClick = async () => {
    const formattedStartDate = format(new Date(itinerary.startDate), "MMM d");
    const formattedEndDate = format(new Date(itinerary.endDate), "d, yyyy");

    const shareData = {
      title: `My WanderGenie Itinerary to ${itinerary.destination.name}!`,
      text: `Check out my AI-planned Itinerary to ${itinerary.destination.name} from ${formattedStartDate} to ${formattedEndDate}. You can plan one too!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "The itinerary URL has been copied to your clipboard." });
    }
  };

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
        cost: a.approximateCost,
      })) || [];
  }, [activeDay, itinerary.itinerary?.days]);

  return (
    <>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <header className="p-4 border-b bg-card flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{itinerary.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground mt-1">
              <span className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(itinerary.startDate), "MMM d")} - {format(new Date(itinerary.endDate), "d, yyyy")}
              </span>
              <span className="flex items-center text-sm"><Users className="h-4 w-4 mr-2" />{itinerary.groupSize ?? 1} traveler(s)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                if (user) {
                  saveItineraryMutation.mutate(itinerary);
                } else {
                  saveItineraryTemporarily(itinerary);
                  setIsSignInOpen(true);
                }
              }}
            >
              <Heart className="mr-2 h-4 w-4" />
              {t("save")}
            </Button>
            <Button variant="outline" onClick={handleShareClick}>
              <Share2 className="mr-2 h-4 w-4" />
              {t("share")}
            </Button>
            <CostBreakdownButton onClick={() => setIsCostPanelOpen(true)} currency={itinerary.currency} />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden bg-muted/20">
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
              {itinerary.destination.latLng && (
                <MapComponent
                  destination={{
                    description: itinerary.destination.name,
                    latLng: {
                      latitude: itinerary.destination.latLng.lat,
                      longitude: itinerary.destination.latLng.lng,
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
          <div className="bg-card flex flex-col overflow-hidden relative">
            <Tabs defaultValue="1" onValueChange={handleDayChange} className="flex-grow flex flex-col">
            <div className="p-4 border-b">
              <TabsList>
                {itinerary.itinerary?.days.map((day: ItineraryDay) => (
                  <TabsTrigger key={day.day} value={String(day.day)} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("day")} {day.day}</TabsTrigger>
                ))}
              </TabsList>
            </div>
              <div className="flex-grow relative">
              {itinerary.itinerary?.days.map((day: ItineraryDay) => (
                <TabsContent key={day.day} value={String(day.day)} className="absolute inset-0 p-4 md:p-6 mt-0 overflow-y-auto">
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
        </div>
        </div>
      </div>
      <CostBreakdownPanel isOpen={isCostPanelOpen} onClose={() => setIsCostPanelOpen(false)} itinerary={itinerary} />
    </>
  );
};
