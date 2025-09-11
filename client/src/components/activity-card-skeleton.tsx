import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ShimmerSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={`relative overflow-hidden bg-muted ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/30 to-muted" />
  </Skeleton>
);

export const ActivityCardSkeleton = () => {
  return (
    <Card className="mb-6 overflow-hidden">
      {/* Visually hidden but accessible to screen readers */}
      <div className="sr-only" role="status">
        Loading activity details...
      </div>
      <div className="grid md:grid-cols-3">
        <div className="md:col-span-1">
          <ShimmerSkeleton className="h-48 w-full md:h-full rounded-none" />
        </div>
        <div className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between p-4">
            <div>
              <ShimmerSkeleton className="h-5 w-20 mb-2" />
              <ShimmerSkeleton className="h-7 w-48" />
            </div>
            <div className="flex items-center pt-1">
              <ShimmerSkeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <div className="space-y-2 mb-4">
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-5/6" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
              <ShimmerSkeleton className="h-4 w-3/4" />
              <ShimmerSkeleton className="h-4 w-1/4" />
              <ShimmerSkeleton className="h-4 w-1/2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <ShimmerSkeleton className="h-8 w-24" />
              <ShimmerSkeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
