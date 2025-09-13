import axios from "axios";
import {
  Activity,
  EnrichedActivity,
  ItineraryDay,
  TripPlanningRequest,
} from "@shared/schema";

const PLACES_API_BASE_URL = "https://places.googleapis.com/v1/places";
const DIRECTIONS_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

/**
 * Finds a place ID for a given activity name and destination context.
 */
async function findPlaceId(
  activity: Activity,
  planningData: TripPlanningRequest
): Promise<string | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn(
      "GOOGLE_MAPS_API_KEY not set. Skipping place search. Returning mock data."
    );
    return `mock_place_id_for_${activity.activityName.replace(/\s+/g, "_")}`;
  }

  const requestBody: {
    textQuery: string;
    locationBias?: object;
    languageCode?: string;
  } = {
    textQuery: "", // Will be set below
    languageCode: planningData.language,
  };

  // Bias search results towards the destination's location for better accuracy
  if (planningData.destinationLatLng) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: planningData.destinationLatLng.lat,
          longitude: planningData.destinationLatLng.lng,
        },
        radius: 50000.0, // 50km radius
      },
    };
  }

  // Attempt 1: Search with a more specific query
  requestBody.textQuery = `${activity.activityName}, ${planningData.destination}`;
  let placeId = await executePlaceSearch(requestBody);

  // Attempt 2 (Fallback): If the first search fails, try a broader query
  if (!placeId) {
    console.log(
      `Fallback search for "${activity.activityName}" in "${planningData.destination}"`
    );
    requestBody.textQuery = activity.activityName;
    placeId = await executePlaceSearch(requestBody);
  }

  return placeId;
}

async function executePlaceSearch(requestBody: object): Promise<string | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const response = await axios.post(
      `${PLACES_API_BASE_URL}:searchText`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY!,
          "X-Goog-FieldMask": "places.id",
        },
      }
    );
    return response.data.places?.[0]?.id || null;
  } catch (error) {
    console.error(
      `Error during place search for "${(requestBody as any).textQuery}":`,
      error
    );
    return null;
  }
}

/**
 * Fetches detailed information for a place using its Place ID.
 */
async function getPlaceDetails(
  placeId: string,
  languageCode: string
): Promise<Partial<EnrichedActivity> | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY not set. Skipping place details.");
    return {};
  }

  const fields = [
    "id",
    "rating",
    "userRatingCount",
    "photos",
    "location",
    "formattedAddress",
    "websiteUri",
  ];
  const fieldMask = fields.join(",");

  try {
    const response = await axios.get(`${PLACES_API_BASE_URL}/${placeId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-Language-Code": languageCode,
        "X-Goog-FieldMask": fieldMask,
      },
    });
    const { userRatingCount, ...rest } = response.data;
    return { ...rest, userRatingsTotal: userRatingCount };
  } catch (error) {
    console.error(`Error fetching details for place ID "${placeId}":`, error);
    return null;
  }
}

/**
 * Calculates travel time and distance between two locations.
 */
async function getTravelTime(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ duration: string; distanceMeters: number } | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn(
      "GOOGLE_MAPS_API_KEY not set. Skipping travel time calculation."
    );
    return {
      duration: `${Math.floor(Math.random() * 45) + 15} mins`,
      distanceMeters: Math.floor(Math.random() * 20000) + 1000,
    };
  }

  const requestBody = {
    origin: { location: { latLng: origin } },
    destination: { location: { latLng: destination } },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
  };

  try {
    const response = await axios.post(DIRECTIONS_API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
      },
    });

    const route = response.data.routes?.[0];
    if (route) {
      return { duration: route.duration, distanceMeters: route.distanceMeters };
    }
    return null;
  } catch (error) {
    console.error("Error calculating travel time:", error);
    return null;
  }
}

/**
 * Enriches a single day's itinerary with real-world data.
 */
export async function enrichItineraryDay(
  day: ItineraryDay,
  planningData: TripPlanningRequest
): Promise<ItineraryDay> {
  const enrichedActivities: EnrichedActivity[] = [];

  for (const activity of day.activities) {
    // 1. Try to find a Place ID.
    const placeId = await findPlaceId(activity, planningData);

    // 2. Initialize the enriched activity with the original data from Gemini.
    let enrichedActivity: EnrichedActivity = { ...activity };

    // 3. If a placeId was found...
    if (placeId) {
      // ...try to get the details.
      const details = await getPlaceDetails(placeId, planningData.language);

      // 4. If details were successfully fetched...
      if (details) {
        // ...merge them into the activity object.
        enrichedActivity = { ...enrichedActivity, ...details };
      }
    }
    // 5. Push the activity to the list. If enrichment failed at any step,
    //    this will be the original Gemini-generated activity.
    enrichedActivities.push(enrichedActivity);
  }

  // Step 4.4: Calculate travel time between activities
  for (let i = 0; i < enrichedActivities.length - 1; i++) {
    const origin = enrichedActivities[i].location;
    const destination = enrichedActivities[i + 1].location;

    if (origin && destination) {
      const travelInfo = await getTravelTime(origin, destination);
      if (travelInfo) {
        // The travel time is from activity `i` to activity `i+1`
        enrichedActivities[i].travelToNext = travelInfo;
      }
    }
  }

  return {
    ...day,
    activities: enrichedActivities,
  };
}
