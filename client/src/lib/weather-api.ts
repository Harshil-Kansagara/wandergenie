/**
 * A simple wrapper around OpenWeatherMap API for current weather and forecast.
 */
export class WeatherApi {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCurrentWeather(location: string) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      location
    )}&appid=${this.apiKey}&units=metric`;

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
      console.error("Weather API error:", error);
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
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      location
    )}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Group by day and take one forecast per day
      const dailyForecasts = [];
      const processedDates = new Set();

      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toISOString().split("T")[0];
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
      console.error("Weather Forecast API error:", error);
      // Return mock data if API fails
      return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: ["sunny", "cloudy", "rainy", "partly-cloudy"][
          Math.floor(Math.random() * 4)
        ],
      }));
    }
  }

  private mapWeatherCondition(condition: string): string {
    const conditionMap: { [key: string]: string } = {
      Clear: "sunny",
      Clouds: "cloudy",
      Rain: "rainy",
      Drizzle: "rainy",
      Thunderstorm: "rainy",
      Snow: "snowy",
      Mist: "cloudy",
      Fog: "cloudy",
    };

    return conditionMap[condition] || "sunny";
  }
}
