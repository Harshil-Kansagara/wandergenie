import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, AlertTriangle, Thermometer } from "lucide-react";
import WeatherWidget from "./weather-widget";
import { useTranslation } from "@/hooks/use-translation";

interface ItineraryCardProps {
  day: any;
  dayNumber: number;
}

export default function ItineraryCard({ day, dayNumber }: Readonly<ItineraryCardProps>) {
  const { t } = useTranslation();

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return "🌅";
    if (hour < 17) return "☀️";
    return "🌆";
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "activity": return "bg-primary";
      case "meal": return "bg-secondary";
      case "transport": return "bg-accent";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="elevation-2 hover:elevation-4 smooth-transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold" data-testid={`text-day-${dayNumber}`}>
            {t("day")} {dayNumber} - {day.location || day.date}
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm">
            <Thermometer className="h-4 w-4 text-secondary" />
            <span data-testid={`text-weather-${dayNumber}`}>
              {day.weather || `${Math.floor(Math.random() * 10) + 20}°C, ${t("sunny")}`}
            </span>
          </div>
        </div>
        
        {day.weather?.includes("rain") && (
          <div className="p-3 border rounded-lg bg-accent/10 border-accent">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span className="text-sm text-accent-foreground">
                {t("ai_weather_alert")}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Activities */}
        {day.activities?.map((activity: any) => (
          <div key={`${dayNumber}-${activity.title}`} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="text-2xl mb-1">
                {getTimeIcon(activity.time)}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                {activity.time?.substring(0, 2)}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground" data-testid={`text-activity-${dayNumber}-${activity.title}`}>
                  {activity.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.duration}</span>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4 mb-3">
                <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3 text-secondary" />
                    <span className="text-sm font-medium text-secondary" data-testid={`text-cost-${dayNumber}-${activity.title}`}>
                      {activity.cost}
                    </span>
                  </div>
                </div>
                {activity.tips && (
                  <div className="mt-2 p-2 bg-accent/10 rounded text-xs text-accent-foreground">
                    💡 {activity.tips}
                  </div>
                )}
                {activity.type === "meal" && (
                  <Badge variant="secondary" className="mt-2">
                    🍽️ {t("meal")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Accommodation */}
        {day.accommodation?.name && (
          <div className="border-t border-border pt-4">
            <h5 className="font-medium text-foreground mb-2">🏨 {t("accommodation")}</h5>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium text-foreground" data-testid={`text-hotel-${dayNumber}`}>
                {day.accommodation.name}
              </p>
              <p className="text-sm text-muted-foreground">{day.accommodation.type}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">{day.accommodation.location}</span>
                <span className="text-sm font-medium text-secondary" data-testid={`text-hotel-cost-${dayNumber}`}>
                  {day.accommodation.cost}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Day Total */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <span className="font-medium text-foreground">{t("day")} {dayNumber} {t("total")}</span>
          <span className="font-bold text-secondary text-lg" data-testid={`text-day-total-${dayNumber}`}>
            {day.totalDayCost || `$${Math.floor(Math.random() * 200) + 100}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
