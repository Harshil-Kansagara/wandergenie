import { useEffect, useState, createContext, useContext, ReactNode, useMemo, useCallback } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useLocation } from "wouter";
import { Itinerary } from "@shared/schema";

const TEMP_ITINERARY_STORAGE_KEY = 'temp-itinerary-for-save';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  isSignInOpen: boolean;
  setIsSignInOpen: (isOpen: boolean) => void;
  saveItineraryTemporarily: (trip: Itinerary) => void;
  getAndClearTemporaryItinerary: () => Itinerary | null;
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

  const signOut = useCallback(() => {
    firebaseSignOut(auth).then(() => {
      setUser(null);
      setLocation("/");
    });
  }, [setLocation]);

  const saveItineraryTemporarily = useCallback((itinerary: Itinerary) => {
    localStorage.setItem(TEMP_ITINERARY_STORAGE_KEY, JSON.stringify(itinerary));
  }, []);

  const getAndClearTemporaryItinerary = useCallback((): Itinerary | null => {
    const itineraryJson = localStorage.getItem(TEMP_ITINERARY_STORAGE_KEY);
    if (itineraryJson) {
      localStorage.removeItem(TEMP_ITINERARY_STORAGE_KEY);
      try {
        return JSON.parse(itineraryJson);
      } catch (e) {
        console.error("Error parsing temporary itinerary JSON:", e);
        return null;
      }
    }
    return null;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signOut,
    isSignInOpen,
    setIsSignInOpen,
    saveItineraryTemporarily,
    getAndClearTemporaryItinerary
  }), [user, loading, signOut, isSignInOpen, saveItineraryTemporarily, getAndClearTemporaryItinerary]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
