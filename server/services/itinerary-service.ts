import { Itinerary } from "@shared/schema";
import { storage } from "../models/storage";

/**
 * Creates a new itinerary and saves it to the database for a specific user.
 * @param itineraryData The itinerary data to save.
 * @returns The newly created itinerary object.
 */
export const createItinerary = async (
  itineraryData: Omit<Itinerary, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const newItinerary = await storage.createItinerary(itineraryData);
  return newItinerary.id;
};

/**
 * Method use to fetch the itinerary by identifier
 * @param id An itinerary identifier
 * @returns The itinerary object
 */
export const getItineraryById = async (
  id: string
): Promise<Itinerary | undefined> => {
  return await storage.getItineraryById(id);
};

export const getItinerariesByUser = async (
  userId: string
): Promise<Itinerary[]> => {
  return await storage.getUserItineraries(userId);
};

/**
 * Partially updates an existing itinerary in the database.
 * @param id The ID of the itinerary to update.
 * @param updates A partial itinerary object with the fields to update.
 * @returns The updated itinerary object.
 */
export const updateItinerary = async (
  id: string,
  updates: Partial<Omit<Itinerary, "id" | "createdAt" | "updatedAt">>
): Promise<Itinerary> => {
  return await storage.updateItinerary(id, updates);
};
