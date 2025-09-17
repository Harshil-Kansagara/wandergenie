import { Trip } from "@shared/schema";
import { storage } from "../models/storage";

/**
 * Creates a new trip and saves it to the database for a specific user.
 * @param tripData The trip data to save.
 * @param userId The ID of the user who owns the trip.
 * @returns The newly created trip object.
 */
export const createTripForUser = async (tripData: Trip): Promise<string> => {
  // The storage.createTrip method should handle setting the id, createdAt, etc.
  const newTrip = await storage.createTrip(tripData);
  return newTrip.id;
};
