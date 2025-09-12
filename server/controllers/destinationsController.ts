import { Request, Response } from "express";
import { storage } from "../models/storage";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";

/**
 * Retrieves a list of all available destinations.
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const getDestinations = async (_req: Request, res: Response) => {
  const destinations = await storage.getDestinations();
  if (!destinations || destinations.length === 0) {
    throw new AppError("No destinations found", 404);
  }
  res.json(ApiResponse.success(destinations));
};

/**
 * Retrieves a list of popular destinations, typically for showcasing on a homepage.
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const getPopularDestinations = async (_req: Request, res: Response) => {
  const destinations = await storage.getPopularDestinations();
  if (!destinations || destinations.length === 0) {
    throw new AppError("No popular destinations found", 404);
  }
  res.json(ApiResponse.success(destinations));
};

/**
 * Retrieves detailed information for a single destination by its ID.
 * @param req The Express request object, containing the destination ID in the URL parameters.
 * @param res The Express response object.
 */
export const getDestination = async (req: Request, res: Response) => {
  const { id } = req.params;
  const destination = await storage.getDestination(id);

  if (!destination) {
    throw new AppError("Destination not found", 404);
  }
  res.json(ApiResponse.success(destination));
};

/**
 * Searches for destinations based on a query string.
 * @param req The Express request object, containing the search query in the query parameters.
 * @param res The Express response object.
 */
export const searchDestinations = async (req: Request, res: Response) => {
  const { q } = req.query;
  const destinations = await storage.searchDestinations(q as string);

  if (!destinations || destinations.length === 0) {
    throw new AppError("No destinations found for the given query", 404);
  }
  res.json(ApiResponse.success(destinations));
};
