import { Request, Response } from "express";
import { ApiResponse } from "../utils/api-response";
import { AppError } from "../middlewares/errorHandler";

/**
 * Provides mock currency exchange rates.
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const getCurrencyRates = async (req: Request, res: Response) => {
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
  res.json(ApiResponse.success({ base, rates }));
};

/**
 * Provides a mock weather forecast for a given location.
 * @param req The Express request object, containing `location` in the query parameters.
 * @param res The Express response object.
 */
export const getWeather = async (req: Request, res: Response) => {
  const { location, date } = req.query;
  if (!location) {
    throw new AppError("Location required", 400);
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
  res.json(ApiResponse.success(weatherData));
};

/**
 * Provides a mock user location based on IP (simulated).
 * @param _req The Express request object.
 * @param res The Express response object.
 */
export const detectUserLocation = async (_req: Request, res: Response) => {
  const locationData = {
    country: "United States",
    countryCode: "US",
    city: "New York",
    currency: "USD",
    language: "en",
    timezone: "America/New_York",
  };
  res.json(ApiResponse.success(locationData));
};

/**
 * Creates a mock payment intent, simulating a Stripe-like API.
 * @param req The Express request object, containing `amount` and `currency` in the body.
 * @param res The Express response object.
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  const { amount, currency = "USD" } = req.body;
  if (!amount) {
    throw new AppError("Amount is required to create a payment intent", 400);
  }
  const paymentIntent = {
    id: `pi_mock_${Date.now()}`,
    client_secret: `pi_mock_${Date.now()}_secret`,
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    status: "requires_payment_method",
  };
  res.json(ApiResponse.success(paymentIntent));
};

/**
 * Confirms a mock payment, simulating a Stripe-like API.
 * @param req The Express request object, containing `payment_intent_id` in the body.
 * @param res The Express response object.
 */
export const confirmPayment = async (req: Request, res: Response) => {
  const { payment_intent_id } = req.body;
  if (!payment_intent_id) {
    throw new AppError("Payment Intent ID is required for confirmation", 400);
  }

  const confirmedPayment = {
    id: payment_intent_id,
    status: "succeeded",
    amount_received: Math.floor(Math.random() * 100000) + 50000,
    currency: "usd",
    receipt_url: `https://receipts.mock.stripe.com/${payment_intent_id}`,
  };

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  res.json(ApiResponse.success({ payment: confirmedPayment }));
};
