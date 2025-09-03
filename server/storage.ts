import { type User, type InsertUser, type Trip, type InsertTrip, type Destination, type InsertDestination, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: string, preferences: { preferredLanguage?: string; preferredCurrency?: string; location?: string }): Promise<User>;

  // Trip methods
  getTrip(id: string): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<Trip>;
  deleteTrip(id: string): Promise<boolean>;

  // Destination methods
  getDestination(id: string): Promise<Destination | undefined>;
  getDestinations(): Promise<Destination[]>;
  getPopularDestinations(): Promise<Destination[]>;
  searchDestinations(query: string): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;

  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByTrip(tripId: string): Promise<Booking[]>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private trips: Map<string, Trip> = new Map();
  private destinations: Map<string, Destination> = new Map();
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    this.seedDestinations();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      location: insertUser.location || null,
      preferredLanguage: insertUser.preferredLanguage || null,
      preferredCurrency: insertUser.preferredCurrency || null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(id: string, preferences: { preferredLanguage?: string; preferredCurrency?: string; location?: string }): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...preferences };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Trip methods
  async getTrip(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId === userId);
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const trip: Trip = {
      ...insertTrip,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertTrip.status || "draft",
      groupSize: insertTrip.groupSize || null,
      accommodation: insertTrip.accommodation || null,
      transport: insertTrip.transport || null,
      itinerary: insertTrip.itinerary || null,
      costBreakdown: insertTrip.costBreakdown || null
    };
    this.trips.set(id, trip);
    return trip;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    const trip = this.trips.get(id);
    if (!trip) throw new Error("Trip not found");
    
    const updatedTrip = { ...trip, ...updates, updatedAt: new Date() };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(id: string): Promise<boolean> {
    return this.trips.delete(id);
  }

  // Destination methods
  async getDestination(id: string): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values());
  }

  async getPopularDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values())
      .filter(dest => dest.isPopular)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }

  async searchDestinations(query: string): Promise<Destination[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.destinations.values()).filter(dest =>
      dest.name.toLowerCase().includes(searchTerm) ||
      dest.country.toLowerCase().includes(searchTerm) ||
      dest.description?.toLowerCase().includes(searchTerm)
    );
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = randomUUID();
    const destination: Destination = { 
      ...insertDestination, 
      id,
      description: insertDestination.description || null,
      imageUrl: insertDestination.imageUrl || null,
      coordinates: insertDestination.coordinates || null,
      averageCost: insertDestination.averageCost || null,
      currency: insertDestination.currency || null,
      popularTimes: insertDestination.popularTimes || null,
      weather: insertDestination.weather || null,
      tags: insertDestination.tags || null,
      rating: insertDestination.rating || null,
      isPopular: insertDestination.isPopular || null
    };
    this.destinations.set(id, destination);
    return destination;
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByTrip(tripId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.tripId === tripId);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
      details: insertBooking.details || null,
      status: insertBooking.status || "pending",
      bookingReference: insertBooking.bookingReference || null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  private seedDestinations() {
    const destinations = [
      {
        name: "Paris",
        country: "France",
        description: "City of Light with iconic landmarks",
        imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
        coordinates: { lat: 48.8566, lng: 2.3522 },
        averageCost: 150,
        currency: "EUR",
        tags: ["heritage", "culture", "romance"],
        rating: 48,
        isPopular: true
      },
      {
        name: "Tokyo",
        country: "Japan", 
        description: "Modern metropolis blending tradition and innovation",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
        coordinates: { lat: 35.6762, lng: 139.6503 },
        averageCost: 120,
        currency: "JPY",
        tags: ["culture", "food", "technology"],
        rating: 47,
        isPopular: true
      },
      {
        name: "New York",
        country: "USA",
        description: "The city that never sleeps",
        imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        averageCost: 180,
        currency: "USD",
        tags: ["urban", "nightlife", "culture"],
        rating: 46,
        isPopular: true
      },
      {
        name: "London",
        country: "UK",
        description: "Historic capital with royal heritage",
        imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
        coordinates: { lat: 51.5074, lng: -0.1278 },
        averageCost: 160,
        currency: "GBP",
        tags: ["heritage", "culture", "museums"],
        rating: 45,
        isPopular: true
      },
      {
        name: "Rome",
        country: "Italy",
        description: "Eternal city with ancient wonders",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
        coordinates: { lat: 41.9028, lng: 12.4964 },
        averageCost: 100,
        currency: "EUR",
        tags: ["heritage", "history", "food"],
        rating: 46,
        isPopular: true
      },
      {
        name: "Barcelona",
        country: "Spain",
        description: "Vibrant city with stunning architecture",
        imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4",
        coordinates: { lat: 41.3851, lng: 2.1734 },
        averageCost: 90,
        currency: "EUR",
        tags: ["culture", "beach", "architecture"],
        rating: 44,
        isPopular: true
      }
    ];

    destinations.forEach(dest => {
      const id = randomUUID();
      this.destinations.set(id, { 
        ...dest, 
        id,
        popularTimes: null,
        weather: null
      });
    });
  }
}

export const storage = new MemStorage();
