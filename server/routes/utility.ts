import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get currency rates (mock endpoint)
router.get("/currency/rates", async (req, res) => {
  try {
    const base = (req.query.base as string) || "USD";
    const rates = {
      USD: 1.0,
      EUR: 0.93,
      GBP: 0.79,
      JPY: 157.0,
      INR: 83.5,
      AUD: 1.5,
      CAD: 1.37,
      CHF: 0.9,
      CNY: 7.25,
      SGD: 1.35,
    };
    res.json({ base, rates, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get weather information (mock endpoint)
router.get("/weather", async (req, res) => {
  try {
    const { location, date } = req.query;
    if (!location) {
      return res.status(400).json({ error: "Location required" });
    }
    const weatherData = {
      location,
      date,
      temperature: Math.floor(Math.random() * 20) + 10, // 10-30 C
      condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][
        Math.floor(Math.random() * 4)
      ],
      humidity: Math.floor(Math.random() * 50) + 50, // 50-100%
      windSpeed: Math.floor(Math.random() * 15), // 0-15 km/h
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        temperature: Math.floor(Math.random() * 20) + 10,
        condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][
          Math.floor(Math.random() * 4)
        ],
      })),
    };
    res.json(weatherData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Detect user location and currency (mock)
router.post("/user/detect-location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const locationData = {
      country: "United States",
      countryCode: "US",
      city: "New York",
      currency: "USD",
      language: "en",
      timezone: "America/New_York",
    };
    res.json(locationData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mock Stripe payment endpoints
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "USD" } = req.body;
    const paymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: "requires_payment_method",
    };
    res.json(paymentIntent);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Mock payment intent creation failed: " + error.message });
  }
});

router.post("/confirm-payment", async (req, res) => {
  try {
    const { payment_intent_id } = req.body;
    const confirmedPayment = {
      id: payment_intent_id,
      status: "succeeded",
      amount_received: Math.floor(Math.random() * 100000) + 50000,
      currency: "usd",
      receipt_url: `https://receipts.mock.stripe.com/${payment_intent_id}`,
    };
    await new Promise((resolve) => setTimeout(resolve, 1500));
    res.json({ success: true, payment: confirmedPayment });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Mock payment confirmation failed: " + error.message });
  }
});

// Mock booking creation endpoint
router.post("/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await storage.createBooking({
      tripId: bookingData.tripId,
      userId: bookingData.userId,
      type: bookingData.type,
      provider: "Mock Provider",
      details: bookingData.details,
      amount: bookingData.amount,
      currency: bookingData.currency,
      status: "confirmed",
      bookingReference: `WG-${Date.now().toString().slice(-8)}`,
    });
    res.json({
      success: true,
      booking,
      message: "Booking confirmed successfully",
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Booking creation failed: " + error.message });
  }
});

export default router;
