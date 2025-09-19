import { z } from "zod";

// API request schemas
export const tripPlanningSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().min(1, "Budget must be positive"),
  currency: z.string().default("USD"),
  theme: z.string(),
  groupSize: z.number().min(1).max(20).default(2),
  accommodation: z.string().optional(),
  transport: z.string().optional(),
  language: z.string().default("en"),
  userId: z.string().optional(),
});

export type TripPlanningRequest = z.infer<typeof tripPlanningSchema>;

export const quizAnswersSchema = z.object({
  answers: z
    .record(z.string(), z.object({ option_text: z.string() }))
    .refine((val) => Object.keys(val).length > 0, {
      message: "Answers object cannot be empty.",
    }),
});
export type QuizAnswersRequest = z.infer<typeof quizAnswersSchema>;

// Itinerary-related types
export interface Activity {
  timeOfDay: string;
  activityName: string;
  description: string;
  approximateCost: string;
  suggestedDuration: string;
  category?:
    | "Food"
    | "Activity"
    | "Transport"
    | "Accommodation"
    | "Miscellaneous";
}

export interface ItineraryDay {
  day: number;
  module: string;
  narrative?: string;
  activities: EnrichedActivity[];
}

export interface EnrichedActivity extends Activity {
  id?: string;
  rating?: number;
  userRatingsTotal?: number | null;
  photos?: { name: string }[];
  location?: { latitude: number; longitude: number };
  formattedAddress?: string;
  websiteUri?: string;
  travelToNext?: {
    duration: string;
    distanceMeters?: number | null;
  };
}

export interface CostBreakdown {
  accommodation: number;
  activities: number;
  transport: number;
  food: number;
  miscellaneous: number;
  total: string;
  isOverBudget: boolean;
  overageAmount: number;
}
// End of Itinerary-related types

// Firebase-based types (mirroring seed data structure)
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Password might not always be present
  preferredLanguage?: string;
  preferredCurrency?: string;
  location?: string;
  createdAt: Date;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  groupSize?: number | null;
  accommodation?: string | null;
  transport?: string | null;
  personaSnapshot: {
    primaryPersona: string;
    moduleDNA: string[];
  };
  destination: {
    name: string;
    latLng?: { lat: number; lng: number } | null;
  };
  itinerary?: {
    days: ItineraryDay[];
  } | null;
  costBreakdown?: CostBreakdown | null;
  status: "draft" | "confirmed" | "past";
  createdAt: Date;
  updatedAt: Date;
  overallSentiment?: "positive" | "negative" | "neutral" | null;
  behavioralSignals?: {
    timeOnPageInSeconds: number;
  } | null;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description?: string | null;
  imageUrl?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  averageCost?: number | null;
  currency?: string | null;
  popularTimes?: any | null;
  weather?: any | null;
  tags?: string[] | null;
  rating?: number | null;
  isPopular?: boolean | null;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon_url: string;
  introduction: string;
  conclusion: string;
  available_modules: string[];
}

export interface QuizOption {
  option_text: string;
  image_url: string;
  persona_scores: {
    [key: string]: number;
  };
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: QuizOption[];
}

export interface ModuleActivity {
  type: string;
  prompt_text: string;
  keywords: string[];
}

export interface ItineraryModule {
  id: string;
  name: string;
  narrative: string;
  activities: ModuleActivity[];
  applicable_seasons: string[];
}

// Types
