import axios from "axios";
import { AppError } from "../middlewares/errorHandler";

const PLACES_API_BASE_URL = "https://places.googleapis.com/v1/places";

/**
 * Geocodes a destination string to get its latitude and longitude.
 * @param destination The name of the destination to geocode (e.g., "Paris, France").
 * @returns A promise that resolves to an object with lat and lng, or null if not found.
 */
export async function geocodeDestination(
  destination: string
): Promise<{ lat: number; lng: number } | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    throw new AppError(
      "Google Maps API key is not configured on the server.",
      500
    );
  }

  try {
    const response = await axios.post(
      `${PLACES_API_BASE_URL}:searchText`,
      { textQuery: destination },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY.replace(/"/g, ""),
          "X-Goog-FieldMask": "places.location",
        },
      }
    );

    const location = response.data.places?.[0]?.location;
    if (location) {
      return { lat: location.latitude, lng: location.longitude };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding destination "${destination}":`, error);
    throw new AppError(`Could not find location for "${destination}".`, 404);
  }
}
