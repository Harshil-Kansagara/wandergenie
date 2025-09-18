import { Link } from "wouter";
import { type Trip } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Wallet,
  Globe,
  Wand2,
  UserCheck,
  BrainCircuit,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth.tsx";
import { t } from "@/lib/translation";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/use-currency";
import { ApiResponse } from "../lib/api-response.ts";
import { ApiClient } from "@/lib/api-client.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge";

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

async function fetchTrips(userId: string | undefined): Promise<Trip[]> {
  if (!userId) return [];
  const response: ApiResponse<Trip[]> = await apiClient.get(`/api/trips/${userId}`);
  return response.data || [];
}

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background text-foreground" aria-busy="true" aria-live="polite">
    <main className="container mx-auto py-12 px-4">
      {/* 1. Personalized Header Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-10 w-1/2 mb-3" />
        <Skeleton className="h-6 w-1/3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. Main Call-to-Action Skeleton */}
          <Card>
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-grow w-full">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </div>
              <Skeleton className="h-14 w-60 shrink-0" />
            </CardContent>
          </Card>

          {/* New: Cost & Trip Metrics Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            <Card><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
            <Card><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          </div>

          {/* 4. Past Adventures & History Skeleton */}
          <div>
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="relative">
              <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
                <Skeleton className="flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)] h-64 rounded-lg" />
                <Skeleton className="flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)] h-64 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-8">
          {/* 3. Persona & Profiling Section Skeleton */}
          <Skeleton className="h-48 w-full rounded-lg" />
          {/* 5. The "Learning" Card Skeleton */}
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
      </div>
    </main>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips", user?.uid],
    queryFn: () => fetchTrips(user?.uid),
    enabled: !!user,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-12 px-4">
        {/* 1. Personalized Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold">Welcome back, {user?.displayName || "Explorer"}!</h1>
          <p className="text-lg text-muted-foreground mt-2">Ready to plan your next adventure?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 2. Main Call-to-Action */}
            <Card className="bg-primary/10 border-primary/20 hover:shadow-xl transition-shadow duration-300">
              <Link href="/planner" className="block">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-primary">Plan a New Trip</h2>
                    <p className="text-muted-foreground mt-1">Let our AI craft your next perfect journey.</p>
                  </div>
                  <Button size="lg" className="bg-primary text-primary-foreground px-8 py-6 text-base shrink-0">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Start Your Next Adventure
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* New: Cost & Trip Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{trips?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Trips Planned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <Wallet className="h-5 w-5 mr-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        trips?.reduce((acc, trip) => acc + (trip.budget || 0), 0) || 0
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Estimated Total Spent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center">
                     <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">
                      {Array.from(new Set(trips?.map(t => t.destination) || [])).length}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Destinations</p>
                </CardContent>
              </Card>
            </div>

            {/* 4. Past Adventures & History */}
            <div>
              <h2 className="text-2xl font-bold mb-4">{t("my_trips")}</h2>
              {!trips || trips.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">{t("no_trips")}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
                    {trips.map((trip) => (
                      <div key={trip.id} className="flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)]">
                        <Card className="hover:shadow-lg transition-shadow duration-300 group h-full">
                          <Link href={`/itinerary/${trip.id}`} className="block h-full flex flex-col">
                            <div className="h-40 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg flex items-center justify-center overflow-hidden">
                              <MapPin className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <CardContent className="p-4 flex-grow flex flex-col justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground mb-2 truncate" data-testid={`text-trip-title-${trip.id}`}>
                                  {trip.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">{trip.destination}</p>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{trip.startDate}</span>
                                </div>
                                <Badge variant={trip.status === "confirmed" ? "default" : "secondary"}>
                                  {t(trip.status || "draft")}
                                </Badge>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* 3. Persona & Profiling Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Your Traveler Persona
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-medium">Cultural Crusader</p>
                <p className="text-sm text-muted-foreground mb-4">70% Cultural, 30% Gastronomic</p>
                <Button variant="outline" asChild>
                  <Link href="/quiz">
                    Refine Your Persona <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* 5. The "Learning" Card */}
            <Card className="bg-secondary/10 border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <BrainCircuit className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "We've noticed you love exploring local markets and historical sites. We'll prioritize these in your next adventure."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
