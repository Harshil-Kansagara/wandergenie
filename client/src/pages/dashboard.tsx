import { Link } from "wouter";
import { type Trip } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth.tsx";
import { t } from "@/lib/translation";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api-client.ts";

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

function fetchTrips(userId: string | undefined) {
  if (!userId) return [];
  return apiClient.get(`/trips/${userId}`);
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["trips", user?.uid],
    queryFn: () => fetchTrips(user?.uid),
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="text-center py-12">{t('loading_trips')}...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('my_trips')}</h1>
          <Button asChild>
            <Link href="/">
              <PlusCircle className="mr-2 h-4 w-4" /> {t('create_new_trip')}
            </Link>
          </Button>
        </div>

        {!trips || trips.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">{t('no_trips')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow duration-300">
                <Link href={`/itinerary/${trip.id}`}>
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium"> → {trip.destination}</p>
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
                      <Badge variant="outline">{trip.theme}</Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
