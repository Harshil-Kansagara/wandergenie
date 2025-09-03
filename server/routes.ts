import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tripPlanningSchema, insertTripSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import axios from "axios"; // Import axios

// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Server started. NODE_ENV:", process.env.NODE_ENV); // Added log for NODE_ENV

  // Generate AI itinerary
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const planningData = tripPlanningSchema.parse(req.body);
      
      const prompt = `Generate a detailed travel itinerary for a trip from ${planningData.origin} to ${planningData.destination} from ${planningData.startDate} to ${planningData.endDate}. 
      
      Trip details:
      - Budget: ${planningData.budget} ${planningData.currency}
      - Group size: ${planningData.groupSize}
      - Theme: ${planningData.theme}
      - Accommodation preference: ${planningData.accommodation || "Any"}
      - Transport preference: ${planningData.transport || "Mixed"}
      
      Please provide a comprehensive itinerary in JSON format with:
      1. Daily activities with time slots, descriptions, and estimated costs
      2. Transportation details between destinations
      3. Accommodation recommendations
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
        "days": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "location": "City/Area",
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
                "tips": "Local tips"
              }
            ],
            "accommodation": {
              "name": "Hotel name",
              "type": "Hotel type",
              "cost": "Cost per night",
              "location": "Address"
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

  // Search destinations
  app.get("/api/destinations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const destinations = await storage.searchDestinations(query);
      res.json(destinations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  // Google Places autocomplete proxy
  app.get("/api/places/autocomplete", async (req, res) => {
    try {
      const { input } = req.query;
      
      if (!input) {
        return res.status(400).json({ error: "Input required" });
      }

      const googlePlacesApiKey = "AIzaSyDSDFluV6by9m4aFd8J5uKwR9eoDmQkPZc"
      console.log("Server-side GOOGLE_PLACES_API_KEY:", googlePlacesApiKey); // Added log
      if (!googlePlacesApiKey) {
        console.warn("GOOGLE_PLACES_API_KEY is not set. Using mock data for places autocomplete.");
        // Fallback to mock data if API key is not set
        const mockPlaces = [
          { place_id: "1", description: `${input}, France`, structured_formatting: { main_text: input, secondary_text: "France" } },
          { place_id: "2", description: `${input}, USA`, structured_formatting: { main_text: input, secondary_text: "USA" } },
          { place_id: "3", description: `${input}, UK`, structured_formatting: { main_text: input, secondary_text: "UK" } },
          { place_id: "4", description: `${input}, Japan`, structured_formatting: { main_text: input, secondary_text: "Japan" } },
          { place_id: "5", description: `${input}, Italy`, structured_formatting: { main_text: input, secondary_text: "Italy" } }
        ];
        return res.json({
          predictions: mockPlaces,
          status: "OK"
        });
      }

      const placesApiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${googlePlacesApiKey}`;
      const response = await axios.get(placesApiUrl);

      res.json(response.data);

    } catch (error: any) {
      console.error("Error fetching places autocomplete:", error);
      res.status(500).json({ error: "Failed to fetch place suggestions: " + error.message });
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
