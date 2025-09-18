import { Link, useRoute } from "wouter";
import { ItineraryDisplay } from "@/components/itinerary-display";
import { Trip } from "@shared/schema";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api-client";
import { ItineraryDisplaySkeleton } from "@/components/itinerary-display-skeleton";
import { useAuth } from "@/hooks/use-auth.tsx";


const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

const ItineraryPageSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8" aria-busy="true" aria-live="polite">
     <Link href="/">
        <Button variant="outline" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Button>
      </Link>
    <ItineraryDisplaySkeleton />
  </div>
);

async function fetchTrip(userId: string ,tripId: string): Promise<{ success: boolean, data: Trip }> {
    // This is a mock implementation. You would replace this with a real API call.
    // For example: return apiClient.get(`/api/trips/${tripId}`);
    // For now, we'll simulate a delay and return the data from history state if available.
    if (!userId || !tripId) {
    throw new Error("User ID and Trip ID are required");
  }
  return apiClient.get(`/api/trips/${userId}/${tripId}`);
}

export default function ItineraryPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/itinerary/:id");
  const tripId = params?.id;

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTrip(user?.uid || 'anonymous', tripId!),
    enabled: !!tripId,
  });

  if (isLoading) {
    return <ItineraryPageSkeleton />;
  }

  if (error || !result?.success) {
    return (
      <div className="text-center p-8 text-destructive">
        <p>{t("no_itinerary_generated")}</p>
        <Link href="/"><Button variant="link" className="mt-4">{t("back_to_home")}</Button></Link>
      </div>
    );
  }

  const trip = result.data;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link href="/">
        <Button variant="outline" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />{t("back_to_home")}</Button>
      </Link>
      <ItineraryDisplay itinerary={trip} />
    </div>
  );
}
