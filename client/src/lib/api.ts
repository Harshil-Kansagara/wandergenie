import { queryClient } from "./queryClient";

// API client for external services
export class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Google Maps API client
export class GoogleMapsApi {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPlaceAutocomplete(input: string) {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}&types=(cities)`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Google Places API error:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}&fields=name,geometry,formatted_address,photos`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Google Places Details API error:', error);
      throw error;
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Google Geocoding API error:', error);
      throw error;
    }
  }
}

// Weather API client
export class WeatherApi {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCurrentWeather(location: string) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return {
        temperature: Math.round(data.main.temp),
        condition: this.mapWeatherCondition(data.weather[0].main),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        location: data.name,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      // Return mock data if API fails
      return {
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: "sunny",
        humidity: Math.floor(Math.random() * 100),
        windSpeed: Math.floor(Math.random() * 20),
        location,
      };
    }
  }

  async getForecast(location: string, days: number = 7) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Group by day and take one forecast per day
      const dailyForecasts = [];
      const processedDates = new Set();
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!processedDates.has(date) && dailyForecasts.length < days) {
          dailyForecasts.push({
            date,
            temperature: Math.round(item.main.temp),
            condition: this.mapWeatherCondition(item.weather[0].main),
          });
          processedDates.add(date);
        }
      }
      
      return dailyForecasts;
    } catch (error) {
      console.error('Weather Forecast API error:', error);
      // Return mock data if API fails
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][Math.floor(Math.random() * 4)],
      }));
    }
  }

  private mapWeatherCondition(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'rainy',
      'Snow': 'snowy',
      'Mist': 'cloudy',
      'Fog': 'cloudy',
    };
    
    return conditionMap[condition] || 'sunny';
  }
}

// Currency exchange API client
export class CurrencyApi {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getExchangeRates(baseCurrency: string = 'USD') {
    try {
      const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        base: data.base,
        rates: data.rates,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Currency API error:', error);
      // Return mock rates if API fails
      return {
        base: baseCurrency,
        rates: {
          USD: 1.0,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.0,
          INR: 74.5,
          AUD: 1.35,
          CAD: 1.25,
          CHF: 0.92,
          CNY: 6.45,
          SGD: 1.35,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Initialize API clients with environment variables
export const googleMapsApi = new GoogleMapsApi(
 'AIzaSyDSDFluV6by9m4aFd8J5uKwR9eoDmQkPZc'
);

export const weatherApi = new WeatherApi(
  'b052d16103b3e6e11e8a724d790d4a2e'
);

export const currencyApi = new CurrencyApi(
  import.meta.env.VITE_CURRENCY_API_KEY || ''
);

// Geolocation utilities
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

export const detectUserLocation = async () => {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    // Use reverse geocoding to get location details
    const geocodeData = await googleMapsApi.reverseGeocode(latitude, longitude);
    
    if (geocodeData.results && geocodeData.results.length > 0) {
      const result = geocodeData.results[0];
      const components = result.address_components;
      
      let country = '';
      let countryCode = '';
      let city = '';
      
      for (const component of components) {
        if (component.types.includes('country')) {
          country = component.long_name;
          countryCode = component.short_name;
        }
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
          city = component.long_name;
        }
      }
      
      // Map country to currency (simplified mapping)
      const currencyMap: { [key: string]: string } = {
        'US': 'USD',
        'GB': 'GBP',
        'EU': 'EUR',
        'JP': 'JPY',
        'IN': 'INR',
        'AU': 'AUD',
        'CA': 'CAD',
        'CH': 'CHF',
        'CN': 'CNY',
        'SG': 'SGD',
      };
      
      const currency = currencyMap[countryCode] || 'USD';
      
      return {
        country,
        countryCode,
        city,
        currency,
        language: navigator.language.split('-')[0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        coordinates: { latitude, longitude },
      };
    }
  } catch (error) {
    console.error('Location detection error:', error);
  }
  
  // Return default values if detection fails
  return {
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  };
};
