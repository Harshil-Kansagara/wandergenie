import { Router } from "express";
import { ItineraryModule, Persona, tripPlanningSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { db } from "../firebase";
import { differenceInDays } from "date-fns";
import { selectItineraryModules } from "../services/itinerary-module-selector";
import { constructDayPrompt } from "../services/prompt-generator";
import { parseItineraryDay } from "../services/itinerary-parser";
import { enrichItineraryDay } from "../services/data-enrichment";
import fs from "fs/promises";
import path from "path";
import { ApiResponse } from "../utility/api-response";
import { catchAsync } from "./catchAsync";
import { AppError } from "./errorHandler";

const router = Router();

// Generate AI itinerary
router.post(
  "/generate-itinerary",
  catchAsync(async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    const planningData = tripPlanningSchema.parse(req.body);
    console.log("Received planning data:", planningData);

    // Fetch persona and all modules from Firestore
    const personaDoc = await db
      .collection("personas")
      .doc(planningData.theme)
      .get();
    if (!personaDoc.exists) {
      throw new AppError(`Persona '${planningData.theme}' not found.`, 404);
    }
    const persona = personaDoc.data() as Persona;

    const modulesSnapshot = await db.collection("itinerary_modules").get();
    const allModules = modulesSnapshot.docs.map(
      (doc) => doc.data() as ItineraryModule
    );

    // Calculate trip duration
    const startDate = new Date(planningData.startDate);
    const endDate = new Date(planningData.endDate);
    const durationInDays = differenceInDays(endDate, startDate) + 1;

    // Select module sequence
    const moduleSequence = selectItineraryModules(
      persona,
      allModules,
      durationInDays,
      startDate
    );

    console.log("Selected module sequence:", moduleSequence);

    const genai = new GoogleGenAI({ apiKey });

    const dailyItineraries = [];
    let remainingBudget = planningData.budget;

    for (let i = 0; i < moduleSequence.length; i++) {
      const dayNumber = i + 1;
      const averageDailyBudget = planningData.budget / durationInDays;
      let dayCost = 0;
      let enrichedDay;
      const moduleId = moduleSequence[i];
      const module = allModules.find((m) => m.id === moduleId);

      if (!module) {
        console.warn(
          `Module with id '${moduleId}' not found. Skipping day ${dayNumber}.`
        );
        continue;
      }

      let attempts = 0;
      const maxAttempts = 2; // Allow up to 2 retries
      let isWithinBudget = false;

      while (attempts < maxAttempts && !isWithinBudget) {
        attempts++;
        const prompt = constructDayPrompt(
          persona,
          planningData,
          module,
          dayNumber,
          remainingBudget,
          durationInDays,
          attempts > 1 // isRetry flag
        );

        console.log(
          `--- PROMPT FOR DAY ${dayNumber} (Attempt ${attempts}) ---`
        );
        console.log(prompt);
        console.log(`-------------------------`);

        const response = await genai.models.generateContent({
          model: "gemini-1.5-flash",
          config: {
            systemInstruction:
              "You are a professional travel planner with extensive knowledge of global destinations, local customs, transportation, accommodations, and activities. Provide detailed, accurate, and practical travel advice.",
            responseMimeType: "application/json",
          },
          contents: prompt,
        });

        if (response.promptFeedback?.blockReason || !response.text) {
          console.warn(
            `Prompt for day ${dayNumber} was blocked or empty. Skipping day.`
          );
          break; // Exit the while loop for this day
        }

        const parsedActivities = parseItineraryDay(response.text);
        enrichedDay = await enrichItineraryDay(
          { day: dayNumber, module: module.name, activities: parsedActivities },
          planningData
        );

        dayCost = enrichedDay.activities.reduce((total, activity) => {
          const cost = parseFloat(
            String(activity.approximateCost).replace(/[^0-9.-]+/g, "")
          );
          return total + (isNaN(cost) ? 0 : cost);
        }, 0);

        // Check if the day's cost is within a reasonable limit (e.g., 150% of the daily average)
        if (dayCost <= averageDailyBudget * 1.5) {
          isWithinBudget = true;
        } else {
          console.warn(
            `Day ${dayNumber} is over budget (Cost: ${dayCost}, Avg Daily: ${averageDailyBudget}). Retrying...`
          );
        }
      }

      if (enrichedDay) {
        remainingBudget -= dayCost;
        dailyItineraries.push(enrichedDay);
      }
    }

    const costBreakdown = dailyItineraries.reduce(
      (breakdown, day) => {
        day.activities.forEach((activity) => {
          const cost = parseFloat(
            String(activity.approximateCost).replace(/[^0-9.-]+/g, "")
          );
          if (!isNaN(cost) && activity.category) {
            const category = activity.category.toLowerCase();
            if (category === "food") {
              breakdown.food += cost;
            } else if (category === "transport") {
              breakdown.transport += cost;
            } else if (category === "accommodation") {
              breakdown.accommodation += cost;
            } else if (category === "activity") {
              breakdown.activities += cost;
            }
          }
        });
        return breakdown;
      },
      {
        accommodation: 0,
        activities: 0,
        transport: 0,
        food: 0,
        miscellaneous: 0,
      }
    );

    const totalCost = Object.values(costBreakdown).reduce(
      (sum, val) => sum + val,
      0
    );

    // For now, we'll just return the array of generated daily itineraries.
    // In a future step, you would parse and combine these into the final JSON structure.
    const itinerary = {
      title: `A ${persona.name}'s trip to ${planningData.destination}`,
      ...planningData,
      persona,
      costBreakdown: {
        ...costBreakdown,
        total: totalCost.toFixed(0),
        isOverBudget: totalCost > planningData.budget,
        overageAmount: Math.max(0, totalCost - planningData.budget),
      },
      itinerary: {
        days: dailyItineraries,
      },
    };

    res.status(200).json(ApiResponse.success(itinerary, 200));
  })
);

export default router;
