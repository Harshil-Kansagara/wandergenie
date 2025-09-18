import {
  type User,
  // type InsertUser,
  Trip,
  type Destination,
  // type Booking,
  // type InsertBooking,
} from "@shared/schema";
import { db } from "../config/firebase";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  // createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(
    id: string,
    preferences: {
      preferredLanguage?: string;
      preferredCurrency?: string;
      location?: string;
    }
  ): Promise<User>;

  // Trip methods
  getTrip(id: string, userId?: string): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;

  updateTrip(
    id: string,
    updates: Partial<Trip>,
    userId?: string
  ): Promise<Trip>;
  deleteTrip(id: string): Promise<boolean>;

  // Destination methods
  getDestination(id: string): Promise<Destination | undefined>;
  getDestinations(): Promise<Destination[]>;
  getPopularDestinations(): Promise<Destination[]>;
  searchDestinations(query: string): Promise<Destination[]>;
  // createDestination(destination: InsertDestination): Promise<Destination>;

  // Booking methods
  // getBooking(id: string): Promise<Booking | undefined>;
  // getBookingsByTrip(tripId: string): Promise<Booking[]>;
  // getBookingsByUser(userId: string): Promise<Booking[]>;
  // createBooking(booking: InsertBooking): Promise<Booking>;
  // updateBookingStatus(id: string, status: string): Promise<Booking>;
}

export class FirebaseStorage implements IStorage {
  private readonly users = db.collection("users");
  private readonly trips = db.collection("trips");
  private readonly destinations = db.collection("destinations");
  private readonly bookings = db.collection("bookings");
  private readonly tripLookups = db.collection("tripLookups");

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.users.doc(id).get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await this.users.where("username", "==", username).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await this.users.where("email", "==", email).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as User;
  }

  // async createUser(insertUser: InsertUser): Promise<User> {
  //   const id = this.users.doc().id;
  //   const user: User = {
  //     ...insertUser,
  //     id,
  //     createdAt: new Date(),
  //     location: insertUser.location || null,
  //     preferredLanguage: insertUser.preferredLanguage || null,
  //     preferredCurrency: insertUser.preferredCurrency || null,
  //   };
  //   await this.users.doc(id).set(user);
  //   return user;
  // }

  async updateUserPreferences(
    id: string,
    preferences: {
      preferredLanguage?: string;
      preferredCurrency?: string;
      location?: string;
    }
  ): Promise<User> {
    const userRef = this.users.doc(id);
    await userRef.update(preferences);
    const doc = await userRef.get();
    return doc.data() as User;
  }

  // Trip methods
  async getTrip(id: string, userId?: string): Promise<Trip | undefined> {
    if (userId) {
      const tripDoc = await this.trips
        .doc(userId)
        .collection("userTrips")
        .doc(id)
        .get();
      return tripDoc.exists ? (tripDoc.data() as Trip) : undefined;
    } else {
      const lookupDoc = await this.tripLookups.doc(id).get();
      if (!lookupDoc.exists) {
        return undefined;
      }
      const { userId } = lookupDoc.data() as { userId: string };
      const tripDoc = await this.trips
        .doc(userId)
        .collection("userTrips")
        .doc(id)
        .get();
      return tripDoc.exists ? (tripDoc.data() as Trip) : undefined;
    }
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    const userIdToQuery = userId === "undefined" ? "anonymous" : userId;
    const snapshot = await this.trips
      .doc(userIdToQuery)
      .collection("userTrips")
      .get();
    return snapshot.docs.map((doc) => doc.data() as Trip);
  }

  async createTrip(insertTrip: Trip): Promise<Trip> {
    const userId =
      insertTrip.userId === "undefined" ? "anonymous" : insertTrip.userId;
    const tripCollection = this.trips.doc(userId).collection("userTrips");
    const newTripRef = tripCollection.doc();
    const trip: Trip = {
      ...insertTrip,
      userId: userId,
      id: newTripRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertTrip.status || "draft",
      groupSize: insertTrip.groupSize || null,
      accommodation: insertTrip.accommodation || null,
      transport: insertTrip.transport || null,
      itinerary: insertTrip.itinerary || null,
      costBreakdown: insertTrip.costBreakdown || null,
      destinationLatLng: insertTrip.destinationLatLng ?? null,
    };
    await newTripRef.set(trip);
    await this.tripLookups.doc(newTripRef.id).set({ userId: userId });
    return trip;
  }

  async updateTrip(
    id: string,
    updates: Partial<Trip>,
    userId?: string
  ): Promise<Trip> {
    let tripRef;
    if (userId) {
      tripRef = this.trips.doc(userId).collection("userTrips").doc(id);
    } else {
      const lookupDoc = await this.tripLookups.doc(id).get();
      if (!lookupDoc.exists) {
        throw new Error("Trip not found");
      }
      const { userId: lookedUpUserId } = lookupDoc.data() as { userId: string };
      tripRef = this.trips.doc(lookedUpUserId).collection("userTrips").doc(id);
    }

    await tripRef.update({ ...updates, updatedAt: new Date() });
    const doc = await tripRef.get();
    return doc.data() as Trip;
  }

  async deleteTrip(id: string): Promise<boolean> {
    const lookupDoc = await this.tripLookups.doc(id).get();
    if (lookupDoc.exists) {
      const { userId } = lookupDoc.data() as { userId: string };
      await this.trips.doc(userId).collection("userTrips").doc(id).delete();
      await this.tripLookups.doc(id).delete();
    }
    return true;
  }

  // Destination methods
  async getDestination(id: string): Promise<Destination | undefined> {
    const doc = await this.destinations.doc(id).get();
    return doc.exists ? (doc.data() as Destination) : undefined;
  }

  async getDestinations(): Promise<Destination[]> {
    const snapshot = await this.destinations.get();
    return snapshot.docs.map((doc) => doc.data() as Destination);
  }

  async getPopularDestinations(): Promise<Destination[]> {
    const snapshot = await this.destinations
      .where("isPopular", "==", true)
      .orderBy("rating", "desc")
      .limit(8)
      .get();
    return snapshot.docs.map((doc) => doc.data() as Destination);
  }

  async searchDestinations(query: string): Promise<Destination[]> {
    const snapshot = await this.destinations.get();
    const searchTerm = query.toLowerCase();
    return snapshot.docs
      .map((doc) => doc.data() as Destination)
      .filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm) ||
          dest.country.toLowerCase().includes(searchTerm) ||
          dest.description?.toLowerCase().includes(searchTerm)
      );
  }

  // async createDestination(
  //   insertDestination: InsertDestination
  // ): Promise<Destination> {
  //   const id = this.destinations.doc().id;
  //   const destination: Destination = {
  //     ...insertDestination,
  //     id,
  //     description: insertDestination.description || null,
  //     imageUrl: insertDestination.imageUrl || null,
  //     coordinates: insertDestination.coordinates || null,
  //     averageCost: insertDestination.averageCost || null,
  //     currency: insertDestination.currency || null,
  //     popularTimes: insertDestination.popularTimes || null,
  //     weather: insertDestination.weather || null,
  //     tags: insertDestination.tags || null,
  //     rating: insertDestination.rating || null,
  //     isPopular: insertDestination.isPopular || null,
  //   };
  //   await this.destinations.doc(id).set(destination);
  //   return destination;
  // }

  // Booking methods
  // async getBooking(id: string): Promise<Booking | undefined> {
  //   const doc = await this.bookings.doc(id).get();
  //   return doc.exists ? (doc.data() as Booking) : undefined;
  // }

  // async getBookingsByTrip(tripId: string): Promise<Booking[]> {
  //   const snapshot = await this.bookings.where("tripId", "==", tripId).get();
  //   return snapshot.docs.map((doc) => doc.data() as Booking);
  // }

  // async getBookingsByUser(userId: string): Promise<Booking[]> {
  //   const snapshot = await this.bookings.where("userId", "==", userId).get();
  //   return snapshot.docs.map((doc) => doc.data() as Booking);
  // }

  // async createBooking(insertBooking: InsertBooking): Promise<Booking> {
  //   const id = this.bookings.doc().id;
  //   const booking: Booking = {
  //     ...insertBooking,
  //     id,
  //     createdAt: new Date(),
  //     details: insertBooking.details || null,
  //     status: insertBooking.status || "pending",
  //     bookingReference: insertBooking.bookingReference || null,
  //   };
  //   await this.bookings.doc(id).set(booking);
  //   return booking;
  // }

  // async updateBookingStatus(id: string, status: string): Promise<Booking> {
  //   const bookingRef = this.bookings.doc(id);
  //   await bookingRef.update({ status });
  //   const doc = await bookingRef.get();
  //   return doc.data() as Booking;
  // }
}

export const storage = new FirebaseStorage();
