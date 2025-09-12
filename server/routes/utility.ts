import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync";
import {
  getCurrencyRates,
  getWeather,
  detectUserLocation,
  createPaymentIntent,
  confirmPayment,
} from "../controllers/utilityController";

const router = Router();

// Get currency rates (mock endpoint)
router.get("/currency/rates", catchAsync(getCurrencyRates));

// Get weather information (mock endpoint)
router.get("/weather", catchAsync(getWeather));

// Detect user location and currency (mock)
router.post("/user/detect-location", catchAsync(detectUserLocation));

// Mock Stripe payment endpoints
router.post("/create-payment-intent", catchAsync(createPaymentIntent));

router.post("/confirm-payment", catchAsync(confirmPayment));

// Mock booking creation endpoint
// router.post("/bookings", async (req, res) => {
//   try {
//     const bookingData = req.body;
//     const booking = await storage.createBooking({
//       tripId: bookingData.tripId,
//       userId: bookingData.userId,
//       type: bookingData.type,
//       provider: "Mock Provider",
//       details: bookingData.details,
//       amount: bookingData.amount,
//       currency: bookingData.currency,
//       status: "confirmed",
//       bookingReference: `WG-${Date.now().toString().slice(-8)}`,
//     });
//     res.json({
//       success: true,
//       booking,
//       message: "Booking confirmed successfully",
//     });
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ error: "Booking creation failed: " + error.message });
//   }
// });

export default router;
