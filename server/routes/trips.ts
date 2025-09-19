import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
// import {
//   saveTrip,
//   getUserTrips,
//   getTrip,
//   updateTrip,
// } from "../controllers/tripsController";

const router = Router();

// Save trip
// router.post("/", catchAsync(saveTrip));

// Get all trips for a user
// router.get("/:userId", catchAsync(getUserTrips));

// Get a specific trip for a user
// router.get("/:userId/:id", catchAsync(getTrip));

// Update a trip
// router.put("/:userId/:id", catchAsync(updateTrip));

export default router;
