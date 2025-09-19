import { Request, Response } from "express";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";
import {
  getAutocompleteSuggestions,
  fetchPlaceDetails,
  fetchDirections,
} from "../services/places-service";

/**
 * Provides place autocomplete suggestions based on user input.
 * Acts as a proxy to the Google Places Autocomplete API.
 * @param req The Express request object, containing the search `input` in the body.
 * @param res The Express response object.
 */
export const autocomplete = async (req: Request, res: Response) => {
  const { input } = req.body;

  if (!input) {
    throw new AppError("Input required", 400);
  }

  const langHeader = req.headers["accept-language"] || "en";
  const languageCode = langHeader.split(",")[0].split("-")[0];

  const suggestions = await getAutocompleteSuggestions(input, languageCode);
  res.json(ApiResponse.success(suggestions));
};

/**
 * Fetches detailed information for a specific place using its Place ID.
 * Acts as a proxy to the Google Places Details API.
 * @param req The Express request object, containing the `placeId` in the body.
 * @param res The Express response object.
 */
export const getPlaceDetails = async (req: Request, res: Response) => {
  const { placeId } = req.body;

  if (!placeId) {
    throw new AppError("Place ID is required", 400);
  }
  const langHeader = req.headers["accept-language"] || "en";
  const languageCode = langHeader.split(",")[0].split("-")[0];

  const placeDetails = await fetchPlaceDetails(placeId,languageCode);
  res.json(ApiResponse.success(placeDetails));
};

/**
 * Calculates directions between an origin, a destination, and optional
 * Acts as a proxy to the Google Routes API.
 * @param req The Express request object, containing `origin`, `destination`, and optional `intermediates` in the body.
 * @param res The Express response object.
 */
export const getDirections = async (req: Request, res: Response) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    throw new AppError(
      "Origin and destination are required for route calculation",
      400
    );
  }

  const langHeader = req.headers["accept-language"] || "en";
  const languageCode = langHeader.split(",")[0].split("-")[0];

  const directions = await fetchDirections(origin, destination,languageCode);
  res.json(ApiResponse.success(directions));
};
