import { Request, Response } from "express";
import axios from "axios";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";

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

  const googlePlacesApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googlePlacesApiKey) {
    console.warn(
      "GOOGLE_MAPS_API_KEY is not set. Using mock data for places autocomplete."
    );
    const mockPlaces = [
      {
        place_id: "1",
        description: `${input}`,
        structured_formatting: {
          main_text: input,
          secondary_text: "Mock Country",
        },
      },
    ];
    return res.json(
      ApiResponse.success({ predictions: mockPlaces, status: "OK" })
    );
  }

  const placesApiUrl = `https://places.googleapis.com/v1/places:autocomplete`;
  const response = await axios.post(
    placesApiUrl,
    { input: input },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googlePlacesApiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
      },
    }
  );

  const formattedPredictions =
    response.data.suggestions?.map((suggestion: any) => ({
      place_id: suggestion.placePrediction.placeId,
      description: suggestion.placePrediction.text?.text || "",
      structured_formatting: {
        main_text:
          suggestion.placePrediction.structuredFormat?.mainText?.text ||
          suggestion.placePrediction.text?.text ||
          suggestion.placePrediction.place?.displayName?.text ||
          "",
        secondary_text:
          suggestion.placePrediction.structuredFormat?.secondaryText?.text ||
          suggestion.placePrediction.place?.formattedAddress ||
          "",
      },
      latLng: suggestion.placePrediction.place?.location
        ? {
            latitude: suggestion.placePrediction.place.location.latitude,
            longitude: suggestion.placePrediction.place.location.longitude,
          }
        : undefined,
    })) || [];

  res.json(
    ApiResponse.success({ predictions: formattedPredictions, status: "OK" })
  );
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

  const googlePlacesApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googlePlacesApiKey) {
    throw new AppError("Server API key not configured.", 500);
  }

  const placesApiUrl = `https://places.googleapis.com/v1/places/${placeId}`;
  const response = await axios.get(placesApiUrl, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googlePlacesApiKey,
      "X-Goog-FieldMask": "location,formattedAddress,displayName.text",
    },
  });

  const placeDetails = response.data;

  res.json(
    ApiResponse.success({
      description: placeDetails.displayName.text,
      formattedAddress: placeDetails.formattedAddress,
      latLng: placeDetails.location
        ? {
            latitude: placeDetails.location.latitude,
            longitude: placeDetails.location.longitude,
          }
        : undefined,
    })
  );
};

/**
 * Calculates directions between an origin, a destination, and optional intermediate waypoints.
 * Acts as a proxy to the Google Routes API.
 * @param req The Express request object, containing `origin`, `destination`, and optional `intermediates` in the body.
 * @param res The Express response object.
 */
export const getDirections = async (req: Request, res: Response) => {
  const { origin, destination, intermediates } = req.body;

  if (!origin || !destination) {
    throw new AppError(
      "Origin and destination are required for route calculation",
      400
    );
  }

  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    throw new AppError("Server API key not configured.", 500);
  }

  const routesApiUrl = `https://routes.googleapis.com/directions/v2:computeRoutes`;

  const requestBody = {
    origin: { location: { latLng: origin } },
    destination: { location: { latLng: destination } },
    intermediates:
      intermediates?.map((loc: any) => ({ location: { latLng: loc } })) || [],
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    languageCode: "en-US",
    units: "METRIC",
  };

  const response = await axios.post(routesApiUrl, requestBody, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleMapsApiKey,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    },
  });

  res.json(ApiResponse.success(response.data));
};
