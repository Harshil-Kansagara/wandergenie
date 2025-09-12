import { Request, Response } from "express";
import { storage } from "../models/storage";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";

/**
 * Saves a new trip to the database. (Currently not implemented).
 * @param req The Express request object, containing trip data.
 * @param res The Express response object.
 */
export const saveTrip = async (req: Request, res: Response) => {
  // const tripData = insertTripSchema.parse(req.body);
  // const trip = await storage.createTrip(tripData);
  // res.status(201).json(ApiResponse.success(trip, 201));
  res.status(501).json(ApiResponse.error("Not Implemented", 501));
};

/**
 * Retrieves all trips associated with a specific user.
 * @param req The Express request object, containing the `userId` in the URL parameters.
 * @param res The Express response object.
 */
export const getUserTrips = async (req: Request, res: Response) => {
  const trips = await storage.getTripsByUser(req.params.userId);
  res.status(200).json(ApiResponse.success(trips));
};

/**
 * Retrieves a single, specific trip by its ID and user ID.
 * @param req The Express request object, containing `userId` and trip `id` in the URL parameters.
 * @param res The Express response object.
 */
export const getTrip = async (req: Request, res: Response) => {
  const { userId, id } = req.params;
  const trip = await storage.getTrip(id, userId);

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  res.status(200).json(ApiResponse.success(trip));
};

/**
 * Updates an existing trip with new data.
 * @param req The Express request object, containing `userId`, trip `id`, and update data.
 * @param res The Express response object.
 */
export const updateTrip = async (req: Request, res: Response) => {
  const { userId, id } = req.params;
  const updates = req.body;

  // Ensure the trip exists before trying to update
  const existingTrip = await storage.getTrip(id, userId);
  if (!existingTrip) {
    throw new AppError("Trip not found", 404);
  }

  const trip = await storage.updateTrip(id, updates, userId);
  res.status(200).json(ApiResponse.success(trip));
};
