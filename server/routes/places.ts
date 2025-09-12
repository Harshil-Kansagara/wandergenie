import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import {
  autocomplete,
  getPlaceDetails,
  getDirections,
} from "../controllers/placesController";

const router = Router();

// Google Places autocomplete proxy
router.post("/autocomplete", catchAsync(autocomplete));

// Get place details by place ID
router.post("/details", catchAsync(getPlaceDetails));

// New endpoint for Google Routes API
router.post("/directions", catchAsync(getDirections));

export default router;
