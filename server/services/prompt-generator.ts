import { ItineraryModule, Persona, TripPlanningRequest } from "@shared/schema";
import { format } from "date-fns";
/**
 * Constructs a prompt for a single day of an itinerary based on persona, trip context, and a specific module.
 *
 * @param persona - The user's travel persona.
 * @param tripDetails - The high-level details of the trip.
 * @param module - The itinerary module for the specific day.
 * @param dayNumber - The current day number in the itinerary.
 * @param remainingBudget - The budget left for the rest of the trip.
 * @param totalDays - The total duration of the trip in days.
 * @param isRetry - A flag to indicate if this is a retry attempt for being over budget.
 * @returns A formatted string prompt for the Gemini API.
 */
export function constructDayPrompt(
  persona: Persona,
  tripDetails: TripPlanningRequest,
  module: ItineraryModule,
  dayNumber: number,
  remainingBudget: number,
  totalDays: number,
  isRetry: boolean = false
): string {
  // Rule 1: Set the Persona and Role
  const roleAndPersona = `You are a travel expert for a ${persona.name} visiting ${tripDetails.destination}. Your goal is to provide a narrative-driven itinerary. All recommendations must be authentic and culturally significant. The user has requested all output to be in the following language: ${tripDetails.language}.`;

  // Rule 2: Inject the Trip Context
  const tripContext = `The destination is ${
    tripDetails.destination
  }.The trip is for ${totalDays} days, and today is Day ${dayNumber}. The total trip budget was ${
    tripDetails.budget
  } ${
    tripDetails.currency
  }, and the remaining budget for the rest of the trip is approximately ${remainingBudget.toFixed(
    2
  )} ${tripDetails.currency}. The group size is ${
    tripDetails.groupSize
  }. The preferred transport is ${
    tripDetails.transport
  }. All cost estimates must be in ${
    tripDetails.currency
  }. Plan today's activities wisely within this remaining budget context.${
    isRetry
      ? " PREVIOUS ATTEMPT WAS OVER BUDGET. BE MORE STRICT WITH COSTS AND FIND CHEAPER ALTERNATIVES."
      : ""
  }`;

  // Rule 3: Use the Module's DNA
  const moduleNarrative = `Today's narrative is: '${module.narrative}'`;
  const activityPrompts = module.activities
    .map((activity) => `For the ${activity.type}, ${activity.prompt_text}`)
    .join(" ");

  // Rule 4: Provide Clear Output Instructions
  const outputInstructions = `
  First, write a single, captivating narrative for the day, capturing the adventurous spirit of the itinerary. Make the tone of the narrative consistent with the user's persona and the day's module theme. The narrative should act as a continuous story, guiding the user through their day.

  After the narrative, provide the structured data for the itinerary as a single JSON object. The top-level key should be "Day${dayNumber}". Inside this object, create nested objects for the time of day. The keys for these nested objects MUST be the translation of "Morning", "Afternoon", and "Evening" into ${tripDetails.language}. Each of these nested objects should contain the following keys: "activityName", "description", "approximateCost", "suggestedDuration", and "category". "timeOfDay" MUST be in ${tripDetails.language}. All text values in the JSON object MUST be in ${tripDetails.language}.

  The "category" must be one of the following strings: "Food", "Activity", "Transport", "Accommodation", "Miscellaneous".
  
  Do not provide any other information or introductory text. Only the JSON object.`;

  // Putting It All Together
  const fullPrompt = [
    roleAndPersona,
    tripContext,
    moduleNarrative,
    activityPrompts,
    outputInstructions,
  ].join("\n\n");

  return fullPrompt;
}
