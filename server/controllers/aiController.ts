import { Request, Response } from "express";
import { tripPlanningSchema } from "@shared/schema";
import { ApiResponse } from "../utils/api-response";
import { generateAndSaveItinerary } from "../services/ai-service";

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

  const newTripId = await generateAndSaveItinerary(planningData);

  res.status(201).json(ApiResponse.success(newTripId, 201));
};
