import axios from "axios";
import { AppError } from "../middlewares/errorHandler";

const GOOGLE_PLACES_API_URL = "https://places.googleapis.com/v1/places";
const GOOGLE_ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

/**
 * Provides google map api key
 * @returns A google map api key
 */
function getGoogleMapApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set.");
    throw new AppError("Server configuration error.", 500);
  }
  return apiKey;
}

/**
 * Provides place autocomplete suggestions based on user input.
 * @param input The user's search input string.
 * @param languageCode The language for the results.
 * @returns A promise that resolves to formatted place predictions.
 */
export async function getAutocompleteSuggestions(
  input: string,
  languageCode: string
) {
  const googlePlacesApiKey = getGoogleMapApiKey();
  const response = await axios.post(
    `${GOOGLE_PLACES_API_URL}:autocomplete`,
    { input, languageCode },
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
    })) || [];

  return { predictions: formattedPredictions, status: "OK" };
}

/**
 * Fetches detailed information for a specific place using its Place ID.
 * @param placeId The Google Place ID.
 * @returns A promise that resolves to the formatted place details.
 */
export async function fetchPlaceDetails(placeId: string,   languageCode: string) {
  const googlePlacesApiKey = getGoogleMapApiKey();
  const response = await axios.get(`${GOOGLE_PLACES_API_URL}/${placeId}?languageCode=`+languageCode, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googlePlacesApiKey,
      "X-Goog-FieldMask": "location,formattedAddress,displayName.text",
    },
  });

  const placeDetails = response.data;

  return {
    description: placeDetails.displayName.text,
    formattedAddress: placeDetails.formattedAddress,
    latLng: placeDetails.location
      ? {
          latitude: placeDetails.location.latitude,
          longitude: placeDetails.location.longitude,
        }
      : undefined,
  };
}

/**
 * Calculates directions between an origin, a destination
 * @param origin The starting point lat/lng.
 * @param destination The ending point lat/lng.
 * @returns A promise that resolves to the route data from Google.
 */
export async function fetchDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },  languageCode: string
) {
  const googleMapsApiKey = getGoogleMapApiKey();

  const requestBody = {
    origin: { location: { latLng: origin } },
    destination: { location: { latLng: destination } },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    languageCode: languageCode,
    units: "METRIC",
  };

  const response = await axios.post(GOOGLE_ROUTES_API_URL, requestBody, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleMapsApiKey,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    },
  });

  return response.data;
}
