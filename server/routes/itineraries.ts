import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import {
  getItinerary,
  linkedUserToItinerary,
  saveItinerary,
} from "server/controllers/itineraryController";

const router = Router();

// Save trip
router.post("/", catchAsync(saveItinerary));

// Fetch specific itinerary by id
router.get("/:id", catchAsync(getItinerary));

// linked user to itinerary
router.patch("/:id", catchAsync(linkedUserToItinerary));

export default router;
