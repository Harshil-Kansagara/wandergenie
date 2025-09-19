import {
  EnrichedActivity,
  Persona,
  Trip,
  TripPlanningRequest,
} from "@shared/schema";
import { ItineraryDay } from "@shared/schema";
import { db } from "../config/firebase";
import { AppError } from "../middlewares/errorHandler";
import { geocodeDestination } from "./geocoding-service";
import { generateItineraryFromData } from "./itinerary-generator";
import { createTripForUser } from "./trip-service";

/**
 * Orchestrates the entire itinerary generation and saving process.
 * @param planningData - The user's trip planning request.
 * @returns The newly created and saved trip object.
 */
export const generateAndSaveItinerary = async (
  planningData: TripPlanningRequest
) => {
  // 1. Fetch persona from Firestore
  const personaDoc = await db
    .collection("personas")
    .doc(planningData.theme)
    .get();
  if (!personaDoc.exists) {
    throw new AppError(`Persona '${planningData.theme}' not found.`, 404);
  }
  const persona = personaDoc.data() as Persona;

  // 2. Geocode destination if lat/lng is missing
  if (!planningData.destinationLatLng) {
    const latLng = await geocodeDestination(planningData.destination);
    if (!latLng) {
      throw new AppError(
        `Could not find coordinates for destination: "${planningData.destination}"`,
        400
      );
    }
    planningData = { ...planningData, destinationLatLng: latLng };
  }

  // 3. Generate itinerary from AI service
  const generatedTripData = {
    ...(await generateItineraryFromData(planningData, persona)),
    destinationLatLng: planningData.destinationLatLng,
  };

  // Ensure userRatingsTotal is null if undefined
  if (generatedTripData.itinerary?.days) {
    generatedTripData.itinerary.days.forEach((day: ItineraryDay) => {
      day.activities.forEach((activity: EnrichedActivity) => {
        if (activity.userRatingsTotal === undefined) {
          activity.userRatingsTotal = null;
        }
      });
    });
  }

  // 4. Save the complete trip to the database with a 'draft' status
  const newTripId = await createTripForUser({
    ...generatedTripData,
    userId: planningData.userId,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const fullTrip: Trip = {
    ...generatedTripData,
    userId: planningData.userId,
    id: newTripId,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return fullTrip;
};

/**
 * Placeholder function for refining a single activity.
 * In a real implementation, this would call the Gemini API with a specific prompt
 * to get a new, alternative activity based on the user's feedback.
 *
 * @param originalActivity The activity the user wants to refine.
 * @param tripContext The full trip context for the AI.
 * @returns A promise that resolves to a new, refined EnrichedActivity.
 */
export async function refineActivity(
  originalActivity: EnrichedActivity,
  tripContext: Trip
): Promise<EnrichedActivity> {
  console.log("Refining activity:", originalActivity.activityName);
  console.log("Trip context:", tripContext.title);
  // This is a mock response. A real implementation would call an AI model here.
  return {
    ...originalActivity,
    activityName: `Refined: ${originalActivity.activityName}`,
    description: `This is a new, alternative suggestion for ${originalActivity.activityName}. It has been updated based on your feedback.`,
  };
}
