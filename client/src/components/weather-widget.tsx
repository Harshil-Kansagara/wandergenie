import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, CloudSnow, Thermometer, Droplets, Wind } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface WeatherWidgetProps {
  destination: string;
  latitude: number;
  longitude: number;
  date?: string;
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
      return <Sun className="h-6 w-6 text-accent" />;
    case 'cloudy':
    case 'partly-cloudy':
      return <Cloud className="h-6 w-6 text-muted-foreground" />;
    case 'rainy':
      return <CloudRain className="h-6 w-6 text-primary" />;
    case 'snowy':
      return <CloudSnow className="h-6 w-6 text-blue-400" />;
    default:
      return <Sun className="h-6 w-6 text-accent" />;
  }
};

const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
      return 'bg-accent/10 text-accent-foreground';
    case 'cloudy':
    case 'partly-cloudy':
      return 'bg-muted text-muted-foreground';
    case 'rainy':
      return 'bg-primary/10 text-primary';
    case 'snowy':
      return 'bg-blue-50 text-blue-600';
    default:
      return 'bg-accent/10 text-accent-foreground';
  }
};

export default function WeatherWidget({ destination, latitude, longitude, date }: WeatherWidgetProps) {
  const { t } = useTranslation();
  
  const { data: weather, isLoading } = useQuery({
    queryKey: ["weatherData", destination, latitude, longitude, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("location", destination);
      params.append("latitude", String(latitude));
      params.append("longitude", String(longitude));
      if (date) {
        params.append("date", date);
      }
      const response = await fetch(`/api/weather?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!destination && !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="elevation-2">
        <CardHeader>
          <CardTitle className="text-lg">{t('weather_forecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }
  
  const displayDate = date ? new Date(date) : new Date();

  return (
    <Card className="elevation-2">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Thermometer className="h-5 w-5 mr-2 text-primary" />
          {t('weather_forecast')} for {displayDate.toLocaleDateString('en', { month: 'long', day: 'numeric' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon((weather as any).condition)}
            <div>
              <p className="font-semibold text-foreground" data-testid="text-current-temp">
                {(weather as any).temperature}°C
              </p>
              <Badge className={getConditionColor((weather as any).condition)} data-testid="badge-weather-condition">
                {t((weather as any).condition.replace('-', '_'))}
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Droplets className="h-3 w-3" />
              <span data-testid="text-humidity">{(weather as any).humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="h-3 w-3" />
              <span data-testid="text-wind-speed">{(weather as any).windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        {(weather as any).forecast && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">{t('7_day_forecast')}</h4>
            <div className="grid grid-cols-7 gap-1">
              {(weather as any).forecast.slice(0, 7).map((day: any, index: number) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </p>
                  <div className="flex justify-center my-1">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <p className="text-xs font-medium" data-testid={`text-forecast-temp-${index}`}>
                    {day.temperature}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Alert */}
        {(weather as any).condition === 'rainy' && (
          <div className="bg-accent/10 border border-accent rounded-lg p-3">
            <p className="text-sm text-accent-foreground">
              ⚠️ {t('rain_expected_pack_umbrella')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
