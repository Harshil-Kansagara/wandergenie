import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Heart, Share2, DollarSign } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslation } from "@/hooks/use-translation";
import { CostBreakdown as CostBreakdownType, Trip } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CostBreakdownProps {
  itinerary: Trip;
  costBreakdown?: CostBreakdownType | null;
  totalCost?: number | string;
  currency?: string;
}

export default function CostBreakdown({ itinerary, costBreakdown, totalCost, currency = "USD" }: Readonly<CostBreakdownProps>) {
  const { convertCurrency, formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const { user, setIsSignInOpen, saveTripTemporarily } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const saveTripMutation = useMutation({
    mutationFn: (trip: Trip) => apiRequest('POST', '/api/trips', trip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: "Trip Saved!",
        description: "Your adventure is waiting for you in 'My Trips'.",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save your trip. Please try again.", variant: "destructive" });
    }
  });

  if (!costBreakdown) {
    return null; // Don't render if there's no cost data
  }
  
  const actualTotal = Number(totalCost) || 0;

  return (
    <Card className="elevation-2 sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl">{t('trip_summary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          {costBreakdown.accommodation > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('accommodation')}</span>
              <span className="font-medium text-foreground" data-testid="text-cost-accommodation">
                {formatCurrency(costBreakdown.accommodation, currency)}
              </span>
            </div>
          )}
          {costBreakdown.activities > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('activities_tours')}</span>
              <span className="font-medium text-foreground" data-testid="text-cost-activities">
                {formatCurrency(costBreakdown.activities, currency)}
              </span>
            </div>
          )}
          {costBreakdown.transport > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('transportation')}</span>
              <span className="font-medium text-foreground" data-testid="text-cost-transport">
                {formatCurrency(costBreakdown.transport, currency)}
              </span>
            </div>
          )}
          {costBreakdown.food > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('meals')}</span>
              <span className="font-medium text-foreground" data-testid="text-cost-meals">
                {formatCurrency(costBreakdown.food, currency)}
              </span>
            </div>
          )}
          {costBreakdown.miscellaneous > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('miscellaneous')}</span>
              <span className="font-medium text-foreground" data-testid="text-cost-misc">
                {formatCurrency(costBreakdown.miscellaneous, currency)}
              </span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">{t('total_2_people')}</span>
            <span className="font-bold text-primary text-xl" data-testid="text-total-cost">
              {formatCurrency(Number(actualTotal) || 0, currency)}
            </span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            ≈ {formatCurrency(convertCurrency(actualTotal, currency, 'USD'), 'USD')} • {t('within_budget_range')}
          </div>
        </div>

        {/* Booking Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 smooth-transition ripple-effect elevation-2"
            data-testid="button-book-trip"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {t('book_complete_trip')}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="secondary" 
              className="py-2 px-3 text-sm font-medium hover:opacity-90 smooth-transition"
              data-testid="button-save-trip"
              onClick={() => {
                if (user) {
                  saveTripMutation.mutate(itinerary);
                } else {
                  saveTripTemporarily(itinerary);
                  setIsSignInOpen(true);
                }
              }}
            >
              <Heart className="mr-1 h-3 w-3" />
              {t('save')}
            </Button>
            <Button 
              variant="outline" 
              className="py-2 px-3 text-sm font-medium hover:bg-muted/80 smooth-transition"
              data-testid="button-share-trip"
            >
              <Share2 className="mr-1 h-3 w-3" />
              {t('share')}
            </Button>
          </div>
        </div>

        {/* Budget Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
            <DollarSign className="h-3 w-3 mr-1" />
            {t('budget_friendly')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
