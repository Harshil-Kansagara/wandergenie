import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Calendar, DollarSign, MapIcon, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Dashboard() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setLocation("/");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setLocation]);

  const { data: trips = [], isLoading: isLoadingTrips } = useQuery({
    queryKey: [`/api/trips/${user?.uid}`],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading user information...</p>
      </div>
    );
  }

  if (!user) {
    // User is not logged in, or is being redirected.
    return null;
  }
  
  const isLoading = isLoadingTrips;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('your_trips')}</h1>
          <p className="text-muted-foreground">{t('manage_your_travel_plans')}</p>
        </div>
        <Button onClick={() => setLocation("/")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back_to_home')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-xl" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-3 w-2/3" />
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (trips as any[]).length === 0 ? (
        <div className="text-center py-16">
          <MapIcon className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">{t('no_trips_yet')}</h3>
          <p className="text-muted-foreground mb-8">{t('start_planning_first_trip')}</p>
          <Link href="/planner">
            <Button size="lg" data-testid="button-create-first-trip">
              <Plus className="h-5 w-5 mr-2" />
              {t('create_your_first_trip')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(trips as any[]).map((trip: any) => (
            <Link key={trip.id} href={`/itinerary/${trip.id}`}>
              <Card className="cursor-pointer hover:elevation-4 smooth-transition">
                <div 
                  className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl flex items-center justify-center"
                >
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">{trip.origin} → {trip.destination}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2" data-testid={`text-trip-title-${trip.id}`}>
                    {trip.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{trip.startDate} - {trip.endDate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{trip.currency} {trip.budget}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'}>
                      {t(trip.status || 'draft')}
                    </Badge>
                    <Badge variant="outline">
                      {trip.theme}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
