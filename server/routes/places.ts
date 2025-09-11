import { Router } from "express";
import axios from "axios";
import { storage } from "../storage";

const router = Router();

// Get popular destinations
router.get("/destinations/popular", async (_req, res) => {
  try {
    const destinations = await storage.getPopularDestinations();
    res.json(destinations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Google Places autocomplete proxy
router.post("/autocomplete", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input required" });
    }

    const langHeader = req.headers["accept-language"] || "en";
    const languageCode = langHeader.split(",")[0].split("-")[0];

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
      return res.json({ predictions: mockPlaces, status: "OK" });
    }
    const placesApiUrl = `https://places.googleapis.com/v1/places:autocomplete`;
    const response = await axios.post(
      placesApiUrl,
      { input: input, languageCode: languageCode },
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

    res.json({ predictions: formattedPredictions, status: "OK" });
  } catch (error: any) {
    console.error("Error fetching places autocomplete:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch place suggestions: " + error.message });
  }
});

// Get place details by place ID
router.post("/details", async (req, res) => {
  try {
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    const googlePlacesApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googlePlacesApiKey) {
      return res.status(500).json({ error: "Server API key not configured." });
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

    res.json({
      description: placeDetails.displayName.text,
      formattedAddress: placeDetails.formattedAddress,
      latLng: placeDetails.location
        ? {
            latitude: placeDetails.location.latitude,
            longitude: placeDetails.location.longitude,
          }
        : undefined,
    });
  } catch (error: any) {
    console.error("Error fetching place details:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch place details: " + error.message });
  }
});

// New endpoint for Google Routes API
router.post("/directions", async (req, res) => {
  try {
    const { origin, destination, intermediates } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        error: "Origin and destination are required for route calculation",
      });
    }

    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      console.error("GOOGLE_MAPS_API_KEY is not set in environment variables.");
      return res.status(500).json({ error: "Server API key not configured." });
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

    res.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching directions from Routes API:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error:
        "Failed to fetch directions: " +
        (error.response ? JSON.stringify(error.response.data) : error.message),
    });
  }
});

export default router;
