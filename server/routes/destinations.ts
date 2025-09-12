import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import {
  getDestinations,
  getPopularDestinations,
  getDestination,
  searchDestinations,
} from "../controllers/destinationsController";

const router = Router();

// Get all destinations
router.get("/", catchAsync(getDestinations));

// Get popular destinations
router.get("/popular", catchAsync(getPopularDestinations));

// Search destinations
router.get("/search", catchAsync(searchDestinations));

// Get a specific destination
router.get("/:id", catchAsync(getDestination));

export default router;
