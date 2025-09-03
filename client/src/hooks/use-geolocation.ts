import { useState, useEffect } from 'react';
import { detectUserLocation } from '@/lib/api';

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
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: false,
    error: null,
    isSupported: 'geolocation' in navigator,
  });

  const detectLocation = async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const locationData = await detectUserLocation();
      setState(prev => ({
        ...prev,
        location: locationData,
        isLoading: false,
      }));
      
      // Cache the location data
      localStorage.setItem('detected_location', JSON.stringify(locationData));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to detect location',
        isLoading: false,
      }));
    }
  };

  const clearLocation = () => {
    setState(prev => ({
      ...prev,
      location: null,
      error: null,
    }));
    localStorage.removeItem('detected_location');
  };

  // Auto-detect location on mount if not already detected
  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('detected_location');
    if (cached) {
      try {
        const locationData = JSON.parse(cached);
        setState(prev => ({ ...prev, location: locationData }));
        return;
      } catch (error) {
        localStorage.removeItem('detected_location');
      }
    }

    // Auto-detect if user hasn't explicitly denied permission
    const permissionDenied = localStorage.getItem('geolocation_denied');
    if (!permissionDenied && state.isSupported) {
      detectLocation();
    }
  }, []);

  return {
    ...state,
    detectLocation,
    clearLocation,
    hasLocation: !!state.location,
  };
}

export function useCurrentPosition() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      setPosition(position);
    } catch (error: any) {
      let errorMessage = 'Failed to get current position';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          localStorage.setItem('geolocation_denied', 'true');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    position,
    isLoading,
    error,
    getCurrentPosition,
    coordinates: position?.coords ? {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    } : null,
  };
}

// Utility hook for watching position changes
export function useWatchPosition() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startWatching = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setPosition(position);
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );

    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    error,
    isWatching: watchId !== null,
    startWatching,
    stopWatching,
    coordinates: position?.coords ? {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    } : null,
  };
}
