import {
  Itinerary,
  ItineraryModule,
  Persona,
  TripPlanningRequest,
} from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { db } from "../config/firebase";
import { differenceInDays } from "date-fns";
import { selectItineraryModules } from "./itinerary-module-selector";
import { constructDayPrompt } from "./prompt-generator";
import { parseItineraryDay } from "./itinerary-parser";
import { enrichItineraryDay } from "./data-enrichment";
import { AppError } from "../middlewares/errorHandler";
import { getTranslateClient } from "../utils/google-cloud-wrapper.js";

/**
 * Generates and enriches the itinerary for a single day.
 * It constructs a prompt, calls the AI model, retries if the generated day is over budget,
 * and enriches the activities with real-world data.
 * @param dayNumber The current day number in the itinerary.
 * @param module The itinerary module for the specific day, containing narrative and activity prompts.
 * @param planningData The overall trip planning request data.
 * @param persona The user's travel persona.
 * @param remainingBudget The budget left for the rest of the trip.
 * @param durationInDays The total duration of the trip in days.
 * @param genai The initialized GoogleGenAI client.
 * @returns A promise that resolves to an object containing the enriched day's itinerary and its calculated cost.
 * Generates the itinerary for a single day, including API calls and budget checks.
 */
async function generateSingleDay(
  dayNumber: number,
  module: ItineraryModule,
  planningData: TripPlanningRequest,
  persona: Persona,
  remainingBudget: number,
  durationInDays: number,
  genai: GoogleGenAI
) {
  const averageDailyBudget = planningData.budget / durationInDays;
  let dayCost = 0;
  let enrichedDay;
  let attempts = 0;
  const maxAttempts = 2;
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
      attempts > 1
    );

    console.log(`--- PROMPT FOR DAY ${dayNumber} (Attempt ${attempts}) ---`);
    console.log(prompt);
    console.log(`-------------------------`);

    const response = await genai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        systemInstruction:
          "You are a professional travel planner with extensive knowledge of global destinations, local customs, transportation, accommodations, and activities. Provide detailed, accurate, and practical travel advice. Your primary goal is to create a detailed, accurate, and practical travel itinerary that STRICTLY adheres to the provided budget. Always prioritize cost-effective options.",
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    if (response.promptFeedback?.blockReason || !response.text) {
      console.warn(
        `Prompt for day ${dayNumber} was blocked or empty. Skipping day.`
      );
      break;
    }

    const parsedActivities = parseItineraryDay(response.text);
    enrichedDay = await enrichItineraryDay(
      {
        day: dayNumber,
        module: module.name,
        activities: parsedActivities,
      },
      planningData
    );

    dayCost = enrichedDay.activities.reduce((total, activity) => {
      const cost = parseFloat(
        String(activity.approximateCost).replace(/[^0-9.-]+/g, "")
      );
      return total + (isNaN(cost) ? 0 : cost);
    }, 0);

    if (dayCost <= averageDailyBudget * 1.5) {
      isWithinBudget = true;
    } else {
      console.warn(
        `Day ${dayNumber} is over budget (Cost: ${dayCost}, Avg Daily: ${averageDailyBudget}). Retrying...`
      );
    }
  }

  return {
    enrichedDay: {
      ...(enrichedDay || { activities: [] }),
      day: dayNumber,
      module: module.name,
      narrative: module.narrative,
    },
    dayCost,
  };
}

/**
 * Orchestrates the generation of a complete, multi-day travel itinerary.
 * This function fetches necessary data, selects daily modules, generates activities for each day
 * via AI, enriches the data, and calculates the final cost breakdown.
 * @param planningData The user's trip planning request, validated against the schema.
 * @param persona The travel persona object that guides the tone and style of the itinerary.
 * @returns A promise that resolves to the fully constructed trip itinerary object.
 */
export async function generateItineraryFromData(
  planningData: TripPlanningRequest,
  persona: Persona
): Promise<
  Omit<
    Itinerary,
    | "id"
    | "userId"
    | "destination"
    | "status"
    | "overallSentiment"
    | "createdAt"
    | "updatedAt"
  >
> {
  const apiKey = process.env.GEMINI_API_KEY?.replace(/"/g, "");
  if (!apiKey) {
    throw new AppError("GEMINI_API_KEY environment variable not set.", 500);
  }

  const modulesSnapshot = await db.collection("itinerary_modules").get();
  const allModules = modulesSnapshot.docs.map(
    (doc) => doc.data() as ItineraryModule
  );

  const startDate = new Date(planningData.startDate);
  const endDate = new Date(planningData.endDate);
  const durationInDays = differenceInDays(endDate, startDate) + 1;

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
    const moduleId = moduleSequence[i];
    const module = allModules.find((m) => m.id === moduleId);

    if (!module) {
      console.warn(
        `Module with id '${moduleId}' not found. Skipping day ${i + 1}.`
      );
      continue;
    }

    const { enrichedDay, dayCost } = await generateSingleDay(
      i + 1,
      module,
      planningData,
      persona,
      remainingBudget,
      durationInDays,
      genai
    );

    if (enrichedDay) {
      remainingBudget -= dayCost;
      dailyItineraries.push(enrichedDay);
    }
  }

  const costBreakdown = dailyItineraries.reduce(
    (breakdown, day) => {
      day.activities?.forEach((activity) => {
        const cost = parseFloat(
          String(activity.approximateCost).replace(/[^0-9.-]+/g, "")
        );
        if (!isNaN(cost) && activity.category) {
          const category = activity.category.toLowerCase();
          if (category === "food") breakdown.food += cost;
          else if (category === "transport") breakdown.transport += cost;
          else if (category === "accommodation")
            breakdown.accommodation += cost;
          else if (category === "activity") breakdown.activities += cost;
        }
      });
      return breakdown;
    },
    { accommodation: 0, activities: 0, transport: 0, food: 0, miscellaneous: 0 }
  );

  const totalCost = Object.values(costBreakdown).reduce(
    (sum, val) => sum + val,
    0
  );

  let tripTitle = `A ${persona.name}'s trip to ${planningData.destination}`;
  if (planningData.language && planningData.language !== "en") {
    try {
      const cloudTranslationApiKey = process.env.CLOUD_TRANSLATION_API_KEY;
      if (cloudTranslationApiKey) {
        const translate = await getTranslateClient();
        const [translation] = await translate.translate(
          tripTitle,
          planningData.language
        );
        tripTitle = translation;
      }
    } catch (e) {
      console.error(
        "Failed to translate trip title, falling back to English.",
        e
      );
    }
  }

  return {
    ...planningData,
    title: tripTitle,
    personaSnapshot: {
      primaryPersona: persona.name,
      moduleDNA: moduleSequence,
    },
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
}
