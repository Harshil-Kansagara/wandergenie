import React from 'react';
import { Button } from './ui/button';
import { DollarSign, Euro, PoundSterling, IndianRupee, LucideIcon } from 'lucide-react';

interface CostBreakdownButtonProps {
  onClick: () => void;
  currency: string;
}

const getCurrencyIcon = (currencyCode: string): LucideIcon => {
  switch (currencyCode.toUpperCase()) {
    case 'USD':
      return DollarSign;
    case 'EUR':
      return Euro;
    case 'GBP':
      return PoundSterling;
    case 'INR':
      return IndianRupee;
    default:
      return DollarSign;
  }
};

export const CostBreakdownButton: React.FC<CostBreakdownButtonProps> = ({ onClick, currency }) => {
  const Icon = getCurrencyIcon(currency);
  return (
    <Button onClick={onClick} variant="outline">
      <Icon className="h-4 w-4 mr-2" />
      <span className="sr-only">Open Cost Breakdown</span>
      Cost Breakdown
    </Button>
  );
};
