import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Heart, Share2, DollarSign } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslation } from "@/hooks/use-translation";

interface CostBreakdownProps {
  costBreakdown?: any;
  totalCost?: string;
  currency?: string;
}

export default function CostBreakdown({ costBreakdown, totalCost, currency = "USD" }: CostBreakdownProps) {
  const { convertCurrency, formatCurrency } = useCurrency();
  const { t } = useTranslation();

  // Mock data if not provided
  const breakdown = costBreakdown || {
    accommodation: "2800",
    activities: "1550",
    transport: "820",
    food: "980",
    miscellaneous: "350"
  };

  const total = totalCost || "6500";
  
  const calculateTotal = () => {
    return Object.values(breakdown).reduce((sum: number, value: unknown) => {
      const stringValue = String(value);
      return sum + parseInt(stringValue.replace(/[^\d]/g, '')) || 0;
    }, 0);
  };

  const actualTotal = calculateTotal();

  return (
    <Card className="elevation-2 sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl">{t('trip_summary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('accommodation')}</span>
            <span className="font-medium text-foreground" data-testid="text-cost-accommodation">
              {formatCurrency(parseInt(String(breakdown.accommodation)) || 0, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('activities_tours')}</span>
            <span className="font-medium text-foreground" data-testid="text-cost-activities">
              {formatCurrency(parseInt(breakdown.activities), currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('transportation')}</span>
            <span className="font-medium text-foreground" data-testid="text-cost-transport">
              {formatCurrency(parseInt(breakdown.transport), currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('meals')}</span>
            <span className="font-medium text-foreground" data-testid="text-cost-meals">
              {formatCurrency(parseInt(breakdown.food), currency)}
            </span>
          </div>
          {breakdown.miscellaneous && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('miscellaneous')}</span>
              <span className="font-medium text-foreground" data-testid="text-cost-misc">
                {formatCurrency(parseInt(breakdown.miscellaneous), currency)}
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
