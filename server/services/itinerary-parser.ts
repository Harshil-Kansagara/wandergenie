import { Activity } from "@shared/schema";
/**
 * Parses the raw text response from the AI into a structured array of activities.
 * @param rawText - The raw string response from the Gemini API.
 * @returns An array of Activity objects.
 */
export function parseItineraryDay(rawText: string): Activity[] {
  try {
    // The raw text is now a JSON string, so we parse it.
    const dayData = JSON.parse(rawText);
    const activities: Activity[] = [];

    // The JSON has a single key like "Day1", "Day2", etc.
    const dayKey = Object.keys(dayData)[0];
    if (!dayKey || typeof dayData[dayKey] !== "object") {
      return [];
    }

    const timeOfDayActivities = dayData[dayKey];

    for (const timeOfDay in timeOfDayActivities) {
      const activityData = timeOfDayActivities[timeOfDay];
      activities.push({
        timeOfDay: timeOfDay,
        activityName: activityData["activityName"] || "N/A",
        description: activityData["description"] || "N/A",
        approximateCost: activityData["approximateCost"] || "N/A",
        suggestedDuration: activityData["suggestedDuration"] || "N/A",
        category: activityData["category"] || "N/A",
      });
    }

    return activities;
  } catch (error) {
    console.error("Failed to parse itinerary day JSON:", error);
    return [];
  }
}
