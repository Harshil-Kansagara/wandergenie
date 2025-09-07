import { Router } from "express";
import { storage } from "../storage";
import { insertTripSchema } from "@shared/schema";

const router = Router();

// Save trip
router.post("/", async (req, res) => {
  try {
    const tripData = insertTripSchema.parse(req.body);
    const trip = await storage.createTrip(tripData);
    res.json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all trips for a user
router.get("/:userId", async (req, res) => {
  try {
    const trips = await storage.getTripsByUser(req.params.userId);
    res.json(trips);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific trip for a user
router.get("/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const trip = await storage.getTrip(id, userId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a trip
router.put("/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const updates = req.body;
    const trip = await storage.updateTrip(id, updates, userId);
    res.json(trip);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
