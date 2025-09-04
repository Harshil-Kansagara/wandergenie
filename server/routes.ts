import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tripPlanningSchema, insertTripSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import axios from "axios"; // Import axios

// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const genai = new GoogleGenAI({
  apiKey: "AIzaSyC6-rzX5Nckcc7UIVe4qgsbWUP9hgyHIqM"
});

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Server started. NODE_ENV:", process.env.NODE_ENV); // Added log for NODE_ENV

  // Generate AI itinerary
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const planningData = tripPlanningSchema.parse(req.body);

      const prompt = `Generate a detailed travel itinerary for a trip to ${planningData.destination} from ${planningData.startDate} to ${planningData.endDate}. 
      
      Trip details:
      - Budget: ${planningData.budget} ${planningData.currency}
      -- Group size: ${planningData.groupSize}
      - Theme: ${planningData.theme}
      - Accommodation preference: ${planningData.accommodation || "Any"}
      - Transport preference: ${planningData.transport || "Mixed"}
      
      Please provide a comprehensive itinerary in JSON format with:
      1. Daily activities with time slots, descriptions, and estimated costs, including latitude and longitude for each activity location.
      2. Transportation details between destinations, including latitude and longitude for any specific transport stops.
      3. Accommodation recommendations, including latitude and longitude for the accommodation location.
      4. Total cost breakdown by category
      5. Weather considerations and backup plans
      6. Local tips and cultural insights
      7. Emergency contact information
      
      Format the response as a JSON object with the following structure:
      {
        "title": "Trip title",
        "duration": "Number of days",
        "totalCost": "Total estimated cost",
        "currency": "Currency code",
        "destinationLatLng": { "latitude": "Number", "longitude": "Number" },
        "days": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "location": "City/Area",
            "locationLatLng": { "latitude": "Number", "longitude": "Number" },
            "weather": "Weather info",
            "activities": [
              {
                "time": "HH:MM",
                "title": "Activity name",
                "description": "Detailed description",
                "cost": "Cost in local currency",
                "duration": "Duration in hours",
                "type": "activity/meal/transport",
                "location": "Specific location",
                "locationLatLng": { "latitude": "Number", "longitude": "Number" },
                "tips": "Local tips"
              }
            ],
            "accommodation": {
              "name": "Hotel name",
              "type": "Hotel type",
              "cost": "Cost per night",
              "location": "Address",
              "locationLatLng": { "latitude": "Number", "longitude": "Number" }
            },
            "totalDayCost": "Total cost for the day"
          }
        ],
        "costBreakdown": {
          "accommodation": "Total accommodation cost",
          "activities": "Total activities cost",
          "transport": "Total transport cost",
          "food": "Total food cost",
          "miscellaneous": "Other expenses"
        },
        "tips": [
          "General travel tips"
        ],
        "emergency": {
          "contacts": ["Emergency contact information"],
          "hospitals": ["Nearby hospitals"],
          "embassies": ["Embassy contacts if international"]
        }
      }`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: "You are a professional travel planner with extensive knowledge of global destinations, local customs, transportation, accommodations, and activities. Provide detailed, accurate, and practical travel advice.",
          responseMimeType: "application/json",
        },
        contents: prompt,
      });

      const itinerary = JSON.parse(response.text || "{}");
      
      res.json({
        success: true,
        data: itinerary
      });

    } catch (error: any) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate itinerary: " + error.message
      });
    }
  });

  // New endpoint for Google Routes API
  app.post("/api/routes/directions", async (req, res) => {
    try {
      const { origin, destination, intermediates } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ error: "Origin and destination are required for route calculation" });
      }

      const googleMapsApiKey = "AIzaSyDGhSY7tnOjca4zKCBjk_RBU-t7Elx298M";

      if (!googleMapsApiKey) {
        console.error("GOOGLE_MAPS_API_KEY is not set in environment variables.");
        return res.status(500).json({ error: "Server API key not configured." });
      }

      const routesApiUrl = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${googleMapsApiKey}`;

      const requestBody = {
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: destination } },
        intermediates: intermediates || [],
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        languageCode: "en-US",
        units: "METRIC",
      };

      const response = await axios.post(routesApiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        }
      });

      res.json(response.data);

    } catch (error: any) {
      console.error("Error fetching directions from Routes API:", error.response ? error.response.data : error.message);
      res.status(500).json({ 
        error: "Failed to fetch directions: " + (error.response ? JSON.stringify(error.response.data) : error.message) 
      });
    }
  });

  // Save trip
  app.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user trips
  app.get("/api/trips/:userId", async (req, res) => {
    try {
      const trips = await storage.getTripsByUser(req.params.userId);
      res.json(trips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get trip by ID
  app.get("/api/trip/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update trip
  app.put("/api/trip/:id", async (req, res) => {
    try {
      const updates = req.body;
      const trip = await storage.updateTrip(req.params.id, updates);
      res.json(trip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get popular destinations
  app.get("/api/destinations/popular", async (req, res) => {
    try {
      const destinations = await storage.getPopularDestinations();
      res.json(destinations);
    }    catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Google Places autocomplete proxy (updated to new Places API)
  app.post("/api/places/autocomplete", async (req, res) => {
    try {
      const { input } = req.body;
      
      console.log(input);
      if (!input) {
        return res.status(400).json({ error: "Input required" });
      }

      const googlePlacesApiKey = "AIzaSyDGhSY7tnOjca4zKCBjk_RBU-t7Elx298M"; // Using environment variable
      console.log("GOOGLE_PLACES_API_KEY for autocomplete:", googlePlacesApiKey); // Log API key

      if (!googlePlacesApiKey) {
        console.warn("GOOGLE_PLACES_API_KEY is not set. Using mock data for places autocomplete.");
        // Fallback to mock data if API key is not set
        const mockPlaces = [
          { place_id: "1", description: `${input}`, structured_formatting: { main_text: input, secondary_text: "France" } },
        ];
        return res.json({
          predictions: mockPlaces,
          status: "OK"
        });
      }

      const placesApiUrl = `https://places.googleapis.com/v1/places:autocomplete`;
      const response = await axios.post(placesApiUrl, { input: input }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googlePlacesApiKey,
          'X-Goog-FieldMask': '*'
        }
      });

      const formattedPredictions = response.data.suggestions?.map((suggestion: any) => ({
        place_id: suggestion.placePrediction.placeId,
        // Use the full text for description initially
        description: suggestion.placePrediction.text?.text || "",
        structured_formatting: {
          // Prioritize structured format if available, otherwise fallback to main text
          main_text: suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text?.text || suggestion.placePrediction.place?.displayName?.text || "",
          secondary_text: suggestion.placePrediction.structuredFormat?.secondaryText?.text || suggestion.placePrediction.place?.formattedAddress || "",
        },
        latLng: suggestion.placePrediction.place?.location ? { 
          latitude: suggestion.placePrediction.place.location.latitude,
          longitude: suggestion.placePrediction.place.location.longitude
        } : undefined
      })) || [];

      res.json({
        predictions: formattedPredictions,
        status: "OK"
      });

    } catch (error: any) {
      console.error("Error fetching places autocomplete:", error);
      res.status(500).json({ error: "Failed to fetch place suggestions: " + error.message });
    }
  });

  app.post("/api/places/details", async (req, res) => {
    try {
      const { placeId } = req.body;

      if (!placeId) {
        return res.status(400).json({ error: "Place ID is required" });
      }

      const googlePlacesApiKey = "AIzaSyDGhSY7tnOjca4zKCBjk_RBU-t7Elx298M";
      if (!googlePlacesApiKey) {
        return res.status(500).json({ error: "Server API key not configured." });
      }

      const placesApiUrl = `https://places.googleapis.com/v1/places/${placeId}`;
      const response = await axios.get(placesApiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googlePlacesApiKey,
          'X-Goog-FieldMask': 'location,formattedAddress,displayName.text'
        }
      });

      const placeDetails = response.data;

      res.json({
        description: placeDetails.displayName.text,
        formattedAddress: placeDetails.formattedAddress,
        latLng: placeDetails.location ? { 
          latitude: placeDetails.location.latitude,
          longitude: placeDetails.location.longitude
        } : undefined
      });

    } catch (error: any) {
      console.error("Error fetching place details:", error);
      res.status(500).json({ error: "Failed to fetch place details: " + error.message });
    }
  });

  // Get currency rates (mock endpoint - in production would use real API)
  app.get("/api/currency/rates", async (req, res) => {
    try {
      const base = req.query.base as string || "USD";
      
      // Mock currency rates - in production, use a real currency API
      const rates = {
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        INR: 74.5,
        AUD: 1.35,
        CAD: 1.25,
        CHF: 0.92,
        CNY: 6.45,
        SGD: 1.35
      };

      res.json({
        base,
        rates,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get weather information (mock endpoint)
  app.get("/api/weather", async (req, res) => {
    try {
      const { location, date } = req.query;
      
      if (!location) {
        return res.status(400).json({ error: "Location required" });
      }

      // Mock weather data - in production, use a real weather API
      const weatherData = {
        location,
        date,
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 100),
        windSpeed: Math.floor(Math.random() * 20),
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          temperature: Math.floor(Math.random() * 30) + 10,
          condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][Math.floor(Math.random() * 4)]
        }))
      };

      res.json(weatherData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Detect user location and currency
  app.post("/api/user/detect-location", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      
      // Mock location detection - in production, use reverse geocoding
      const locationData = {
        country: "United States",
        countryCode: "US", 
        city: "New York",
        currency: "USD",
        language: "en",
        timezone: "America/New_York"
      };

      res.json(locationData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mock Stripe payment endpoints
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "USD" } = req.body;
      
      // Mock payment intent creation
      const paymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret`,
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        status: "requires_payment_method",
      };
      
      res.json(paymentIntent);
    } catch (error: any) {
      res.status(500).json({ 
        error: "Mock payment intent creation failed: " + error.message 
      });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { payment_intent_id, payment_method } = req.body;
      
      // Mock payment confirmation - always succeeds in development
      const confirmedPayment = {
        id: payment_intent_id,
        status: "succeeded",
        amount_received: Math.floor(Math.random() * 100000) + 50000,
        currency: "usd",
        receipt_url: `https://receipts.mock.stripe.com/${payment_intent_id}`,
      };
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json({
        success: true,
        payment: confirmedPayment,
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Mock payment confirmation failed: " + error.message 
      });
    }
  });

  // Mock booking creation endpoint
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = req.body;
      
      // Create a mock booking
      const booking = await storage.createBooking({
        tripId: bookingData.tripId,
        userId: bookingData.userId,
        type: bookingData.type,
        provider: "Mock Provider",
        details: bookingData.details,
        amount: bookingData.amount,
        currency: bookingData.currency,
        status: "confirmed",
        bookingReference: `WA-${Date.now().toString().slice(-8)}`,
      });
      
      res.json({
        success: true,
        booking,
        message: "Booking confirmed successfully",
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Booking creation failed: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
