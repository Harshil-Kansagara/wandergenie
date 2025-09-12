import { Request, Response } from "express";
import { Persona, tripPlanningSchema } from "@shared/schema";
import { db } from "../config/firebase";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";
import { generateItineraryFromData } from "../services/itinerary-generator";

/**
 * Handles the generation of a personalized travel itinerary.
 * It parses the user's request, fetches the relevant travel persona,
 * and then calls the itinerary generation service to create the trip plan.
 * @param req The Express request object, containing trip planning data in the body.
 * @param res The Express response object.
 */
export const generateItinerary = async (req: Request, res: Response) => {
  const planningData = tripPlanningSchema.parse(req.body);
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

  const itinerary = await generateItineraryFromData(planningData, persona);

  res.status(200).json(ApiResponse.success(itinerary, 200));
};
