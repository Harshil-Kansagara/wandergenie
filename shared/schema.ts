import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("en"),
  preferredCurrency: text("preferred_currency").default("USD"),
  location: text("location"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  origin: text("origin"), // Made origin nullable
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  budget: integer("budget").notNull(),
  currency: text("currency").notNull(),
  theme: text("theme").notNull(),
  groupSize: integer("group_size").default(2),
  accommodation: text("accommodation"),
  transport: text("transport"),
  itinerary: jsonb("itinerary"),
  costBreakdown: jsonb("cost_breakdown"),
  status: text("status").default("draft"), // draft, confirmed, completed
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const destinations = pgTable("destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  coordinates: jsonb("coordinates"), // {lat, lng}
  averageCost: integer("average_cost"),
  currency: text("currency"),
  popularTimes: jsonb("popular_times"),
  weather: jsonb("weather"),
  tags: text("tags").array(),
  rating: integer("rating").default(0),
  isPopular: boolean("is_popular").default(false),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").references(() => trips.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // accommodation, transport, activity
  provider: text("provider").notNull(),
  details: jsonb("details"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").default("pending"), // pending, confirmed, cancelled
  bookingReference: text("booking_reference"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Additional schemas for API requests
export const tripPlanningSchema = z.object({
  origin: z.string().optional(), // Made origin optional
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().min(1, "Budget must be positive"),
  currency: z.string().default("USD"),
  theme: z.string(),
  groupSize: z.number().min(1).max(20).default(2),
  accommodation: z.string().optional(),
  transport: z.string().optional(),
  language: z.string().default("en"),
});

export type TripPlanningRequest = z.infer<typeof tripPlanningSchema>;
