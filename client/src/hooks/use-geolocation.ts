import { GoogleMapsApi } from "@/lib/google-maps-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useState } from "react";
import { detectCurrencyFromLocation } from "@/lib/currency";

export const googleMapsApi = new GoogleMapsApi(
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || undefined
);

export interface LocationData {
  country: string;
  countryCode: string;
  city: string;
  currency: string;
  language: string;
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface GeolocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  detectLocation: () => void;
  clearLocation: () => void;
  hasLocation: boolean;
}

/**
 * Method to use geolocation and manage location state.
 * @returns GeolocationState and methods to detect and clear location
 */
export function useGeolocation() {
  const queryClient = useQueryClient();
  const {
    data: location,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery<LocationData, Error>({
    queryKey: ["geolocation"],
    queryFn: detectUserLocation,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: false, // Don't retry on error, let user trigger manually
    refetchOnWindowFocus: false, // Don't refetch on window focus
    initialData: () => {
      // Try to load from cache first
      const cached = localStorage.getItem("detected_location");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached location data:", e);
          localStorage.removeItem("detected_location");
        }
      }
      return undefined;
    },
  });

  // Effect to cache the location data when it's successfully fetched
  useEffect(() => {
    if (location) {
      localStorage.setItem("detected_location", JSON.stringify(location));
    }
  }, [location]);

  const clearLocation = useCallback(() => {
    localStorage.removeItem("detected_location");
    queryClient.invalidateQueries({ queryKey: ["geolocation"] });
  }, [queryClient]);

  return {
    location: location ?? null,
    isLoading,
    error: isError ? error.message : null,
    isSupported: "geolocation" in navigator,
    detectLocation: refetch,
    clearLocation,
    hasLocation: !!location,
  };
}

/**
 * Method to get the current position using the Geolocation API.
 * @returns Promise that resolves with the current position or rejects with an error
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      return reject(new Error("Geolocation is not supported by this browser"));
    }

    // Let the browser handle accuracy and caching with a reasonable timeout.
    // It will attempt high accuracy and fall back if needed.
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds
      maximumAge: 60000, // 1 minute
    });
  });
};

/**
 * Method to detect user's location using Geolocation API and reverse geocoding.
 * @returns Detected location data or default values
 */
export const detectUserLocation = async () => {
  try {
    const position = await getCurrentPosition();
    console.log("Detected position:", position);

    const { latitude, longitude } = position.coords;

    // Use reverse geocoding to get location details
    const geocodeData = await googleMapsApi.reverseGeocode(latitude, longitude);

    if (geocodeData.results && geocodeData.results.length > 0) {
      console.log("Geocode data:", geocodeData);
      const result = geocodeData.results[0];
      const components = result.address_components;

      let country = "";
      let countryCode = "";
      let city = "";

      for (const component of components) {
        if (component.types.includes("country")) {
          country = component.long_name;
          countryCode = component.short_name;
        }
        if (
          component.types.includes("locality") ||
          component.types.includes("administrative_area_level_1")
        ) {
          city = component.long_name;
        }
      }

      const currency = detectCurrencyFromLocation(countryCode);

      return {
        country,
        countryCode,
        city,
        currency,
        language: navigator.language.split("-")[0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        coordinates: { latitude, longitude },
      };
    }
  } catch (error) {
    console.error("Location detection error:", error);
    if (error instanceof Error && error.message.includes("denied")) {
      localStorage.setItem("geolocation_denied", "true");
      // We throw a more specific error to be handled by the UI
      throw new Error(
        "Location access has been denied. Please enable it in your browser settings."
      );
    } else if (localStorage.getItem("geolocation_denied")) {
      throw new Error("Location access was previously denied.");
    }
    throw error; // Re-throw the error so React Query can handle it
  }

  // Return default values if detection fails
  return {
    country: "India",
    countryCode: "IN",
    city: "Delhi",
    currency: "INR",
    language: "en-IN",
    timezone: "Asia/Kolkata",
    coordinates: { latitude: 28.6139, longitude: 77.209 },
  };
};

/**
 * Method to get the current position using react-query.
 * @returns Current position, loading state, error and a method to manually fetch the position
 */
export function useCurrentPosition() {
  const {
    data: position,
    isLoading,
    error,
    refetch,
  } = useQuery<GeolocationPosition, Error>({
    queryKey: ["current-position"],
    queryFn: getCurrentPosition,
    enabled: false, // The query will not run automatically
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    position: position ?? null,
    isLoading,
    error: error?.message ?? null,
    getCurrentPosition: refetch,
    coordinates: position?.coords
      ? {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      : null,
  };
}

/**
 * Utility hook for continuously watching the user's position.
 * @param options - Configuration for watching the position.
 * @param options.enabled - Whether to start watching. Defaults to true.
 * @param options.options - Geolocation options (enableHighAccuracy, timeout, maximumAge).
 */
export function useWatchPosition({
  enabled = true,
  options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  },
}: {
  enabled?: boolean;
  options?: PositionOptions;
} = {}) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !("geolocation" in navigator)) {
      if (enabled) {
        setError("Geolocation is not supported by this browser");
      }
      return;
    }

    setError(null);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition(pos),
      (err) => setError(err.message),
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, options]);

  return {
    position,
    error,
    coordinates: position?.coords
      ? {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      : null,
  };
}
