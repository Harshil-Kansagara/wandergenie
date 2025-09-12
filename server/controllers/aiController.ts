import { Request, Response } from "express";
import { Persona, tripPlanningSchema, Trip } from "@shared/schema";
import { db } from "../config/firebase";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";
import { generateItineraryFromData } from "../services/itinerary-generator";
import { geocodeDestination } from "../services/geocoding-service";

/**
 * Handles the generation of a personalized travel itinerary.
 * It parses the user's request, fetches the relevant travel persona,
 * and then calls the itinerary generation service to create the trip plan.
 * @param req The Express request object, containing trip planning data in the body.
 * @param res The Express response object.
 */
export const generateItinerary = async (req: Request, res: Response) => {
  let planningData = tripPlanningSchema.parse(req.body);
  console.log("Received planning data:", planningData);

  // Fetch persona and all modules from Firestore
  const personaDoc = await db
    .collection("personas")
    .doc(planningData.theme)
    .get();
  if (!personaDoc.exists) {
    throw new AppError(`Persona '${planningData.theme}' not found.`, 404);
  }
  const persona = personaDoc.data() as Persona;

  // If destinationLatLng is missing, derive it from the destination string.
  if (!planningData.destinationLatLng) {
    const latLng = await geocodeDestination(planningData.destination);
    if (!latLng) {
      throw new AppError(
        `Could not find coordinates for destination: "${planningData.destination}"`,
        400
      );
    }
    // Add the derived lat/lng to the planning data
    planningData = { ...planningData, destinationLatLng: latLng };
  }

  // The object returned from the service is a partial trip. We complete it here.
  const generatedTripData = {
    ...(await generateItineraryFromData(planningData, persona)),
    destinationLatLng: planningData.destinationLatLng,
  };

  // Construct a full Trip object that matches the schema
  const fullTrip: Trip = {
    ...generatedTripData,
    id: `temp_${Date.now()}`, // A temporary ID. In a real app, this would come from the DB.
    userId: "anonymous", // Or req.user.id if you have authentication
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  res.status(200).json(ApiResponse.success(fullTrip, 200));
};
