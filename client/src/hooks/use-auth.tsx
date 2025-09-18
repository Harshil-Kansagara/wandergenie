import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useLocation } from "wouter";
import { Trip } from "@shared/schema";

const TEMP_TRIP_STORAGE_KEY = 'temp-trip-for-save';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  isSignInOpen: boolean;
  setIsSignInOpen: (isOpen: boolean) => void;
  saveTripTemporarily: (trip: Trip) => void;
  getAndClearTemporaryTrip: () => Trip | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = () => {
    firebaseSignOut(auth).then(() => {
      setUser(null);
      setLocation("/");
    });
  };

  const saveTripTemporarily = (trip: Trip) => {
    localStorage.setItem(TEMP_TRIP_STORAGE_KEY, JSON.stringify(trip));
  };

  const getAndClearTemporaryTrip = (): Trip | null => {
    const tripJson = localStorage.getItem(TEMP_TRIP_STORAGE_KEY);
    if (tripJson) {
      // localStorage.removeItem(TEMP_TRIP_STORAGE_KEY);
      try {
        return JSON.parse(tripJson);
      } catch (e) {
        console.error("Error parsing temporary trip JSON:", e);
        return null;
      }
    }
    return null;
  };

  const value = { user, loading, signOut, isSignInOpen, setIsSignInOpen, saveTripTemporarily, getAndClearTemporaryTrip };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
