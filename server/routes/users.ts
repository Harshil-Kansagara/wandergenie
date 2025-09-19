import { getUserItineraries } from "server/controllers/itineraryController";
import { catchAsync } from "server/middlewares/catchAsync";
import { Router } from "express";

const router = Router();

// Get all itineraries for a user
router.get("/:userId/itineraries", catchAsync(getUserItineraries));

export default router;
