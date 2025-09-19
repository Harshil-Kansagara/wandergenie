import { Trip } from "@shared/schema";
import { storage } from "../models/storage";

/**
 * Creates a new trip and saves it to the database for a specific user.
 * @param tripData The trip data to save.
 * @param userId The ID of the user who owns the trip.
 * @returns The newly created trip object.
 */
export const createTripForUser = async (
  tripData: Omit<Trip, "id">
): Promise<string> => {
  // The storage.createTrip method should handle setting the id, createdAt, etc.
  const newTrip = await storage.createTrip(tripData);
  return newTrip.id;
};

/**
 * Method is used to fetch the trip details
 * @param tripId The ID of the trip
 * @returns The trip data
 */
export const getTripById = async (
  tripId: string
): Promise<Trip | undefined> => {
  return storage.getTrip(tripId);
};
