import { Link, useRoute } from "wouter";
import { ItineraryDisplay } from "@/components/itinerary-display";
import { Itinerary } from "@shared/schema";
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

async function fetchItinerary(itineraryId: string, userId: string): Promise<{ success: boolean, data: Itinerary }> {
  // 1. fetch the trip from the API.
  // This happens when clicking a link from the dashboard.
  const response = await apiClient.get(`/api/itineraries/${itineraryId}`);
  if (!response.success) throw new Error(response.error || "Itinerary not found");
  return response;
}

export default function ItineraryPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/itinerary/:id");
  const itineraryId = params?.id;

  const { data: result, isLoading, error } = useQuery({
    // Add user.uid to the queryKey to refetch if the user changes
    queryKey: ["itinerary", itineraryId, user?.uid],
    queryFn: () => fetchItinerary(itineraryId!, user?.uid || 'anonymous'),
    enabled: !!itineraryId && !authLoading, // Run as long as we have a tripId and auth state is resolved
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
