import { useEffect, useState } from "react";
import { Link } from "wouter";
import { type Trip } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin,  Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/translation";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      if (user) {
        try {
          // On the client, you would typically fetch from your API endpoint
          const response = await fetch(`/api/trips/${user.uid}`);
          if (!response.ok) {
            throw new Error('Failed to fetch trips');
          }
          const userTrips = await response.json();
          setTrips(userTrips);
        } catch (error) {
          console.error("Error fetching trips:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTrips();
  }, [user]);

  if (loading) {
    return <div className="text-center py-12">Loading trips...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
          <Button asChild>
            <Link to="/new-trip">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Trip
            </Link>
          </Button>
        </div>

        {trips.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">You haven't created any trips yet.</p>
              <Button asChild className="mt-4">
                <Link to="/new-trip">Start Planning Now</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow duration-300">
                <Link key={trip.id} href={`/itinerary/${trip.id}`}>
              <Card className="cursor-pointer hover:elevation-4 smooth-transition">
                <div 
                  className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl flex items-center justify-center"
                >
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
                    <Badge variant="outline">
                      {trip.theme}
                    </Badge>
                  </div>
              </CardContent>
              </Card>
              </Link>
              </Card>
            ))}
            </div>
        )}
      </main>
    </div>
  );
}
