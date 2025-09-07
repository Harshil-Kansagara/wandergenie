import { Router } from "express";
import { tripPlanningSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Generate AI itinerary
router.post("/generate-itinerary", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    const planningData = tripPlanningSchema.parse(req.body);
    console.log("Received planning data:", planningData);
    const prompt = `Generate a detailed travel itinerary for a trip to ${
      planningData.destination
    } from ${planningData.startDate} to ${planningData.endDate}. 
      
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

    const genai = new GoogleGenAI({
      apiKey: apiKey,
    });
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction:
          "You are a professional travel planner with extensive knowledge of global destinations, local customs, transportation, accommodations, and activities. Provide detailed, accurate, and practical travel advice.",
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const itinerary = JSON.parse(response.text || "{}");

    res.json({
      success: true,
      data: itinerary,
    });
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate itinerary: " + error.message,
    });
  }
});

export default router;
