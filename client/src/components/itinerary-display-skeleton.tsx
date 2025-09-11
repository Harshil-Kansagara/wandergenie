import { ActivityCardSkeleton } from "./activity-card-skeleton";
import { Skeleton } from "./ui/skeleton";

const ShimmerSkeleton = ({ className }: { className?: string }) => (
    <Skeleton className={`relative overflow-hidden bg-muted ${className}`} />
);

export const ItineraryDisplaySkeleton = () => {
    return (
        <div className="itinerary-display">
            <header className="mb-12 text-center p-8 bg-card border rounded-lg">
                <ShimmerSkeleton className="h-12 w-3/4 mx-auto mb-4" />
                <ShimmerSkeleton className="h-5 w-1/2 mx-auto mb-6" />
                <div className="mt-6 flex items-center justify-center space-x-4">
                    <ShimmerSkeleton className="h-5 w-48" />
                    <ShimmerSkeleton className="h-5 w-24" />
                </div>
            </header>

            {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="day-plan mb-8">
                    <ShimmerSkeleton className="h-10 w-1/2 mb-4" />
                    <ShimmerSkeleton className="h-5 w-full mb-6" />
                    <ActivityCardSkeleton />
                    <ActivityCardSkeleton />
                </div>
            ))}
        </div>
    );
};
