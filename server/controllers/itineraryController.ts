import { Request, Response } from "express";
import { Itinerary } from "@shared/schema";
import {
  createItinerary,
  getItinerariesByUser,
  getItineraryById,
} from "server/services/itinerary-service";
import { ApiResponse } from "server/utils/api-response";
import { AppError } from "server/middlewares/errorHandler";

/**
 * Saves a new itinerary to the database.
 * @param req The Express request object, containing trip data.
 * @param res The Express response object.
 */
export const saveItinerary = async (req: Request, res: Response) => {
  const itineraryData: Itinerary = req.body;

  const newItinerary = await createItinerary(itineraryData);
  res.status(201).json(ApiResponse.success(newItinerary, 201));
};

/**
 * Fetch an itinerary by identifier from the database
 * @param req
 * @param res
 */
export const getItinerary = async (req: Request, res: Response) => {
  const itinerary = await getItineraryById(req.params.id);

  if (!itinerary) {
    throw new AppError("Itinerary not found", 404);
  }

  res.status(200).json(ApiResponse.success(itinerary));
};

/**
 * Retrieves all itineraries associated with a specific user.
 * @param req The Express request object, containing the `userId` in the URL parameters.
 * @param res The Express response object.
 */
export const getUserItineraries = async (req: Request, res: Response) => {
  const itineraries = await getItinerariesByUser(req.params.userId);
  res.status(200).json(ApiResponse.success(itineraries));
};

export const linkedUserToItinerary = async (req: Request, res: Response) => {};
