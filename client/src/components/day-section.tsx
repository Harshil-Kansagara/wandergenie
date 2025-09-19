import React, { useEffect, useRef } from "react";
import { ItineraryDay, EnrichedActivity, Persona } from "@shared/schema";
import { ActivityCard } from "./activity-card";

interface DaySectionProps {
  day: ItineraryDay;
  persona?: Persona;
  currency: string;
  hoveredActivityIndex: number | null;
}

export const DaySection: React.FC<DaySectionProps> = ({
  day,
  persona,
  currency,
  hoveredActivityIndex,
}) => {
  const dayRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={dayRef}>
      <div className="space-y-6">
        {day.activities?.map((activity: EnrichedActivity, index: number) => (
          <ActivityCard 
            key={`${day.day}-${activity.activityName}`} 
            activity={activity} 
            currency={currency} 
            id={`day-${day.day}-activity-${index}`}
            isHovered={hoveredActivityIndex === index}
          />
        ))}
      </div>
    </div>
  );
};
