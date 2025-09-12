import { Router } from "express";
import { generateItinerary } from "../controllers/aiController";
import { catchAsync } from "../middlewares/catchAsync";

const router = Router();

// Generate AI itinerary
router.post("/generate-itinerary", catchAsync(generateItinerary));

export default router;
