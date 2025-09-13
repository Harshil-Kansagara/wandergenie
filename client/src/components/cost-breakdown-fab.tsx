import React from 'react';
import { Button } from './ui/button';
import { DollarSign, Euro, PoundSterling, IndianRupee, LucideIcon } from 'lucide-react';

interface CostBreakdownFABProps {
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

export const CostBreakdownFAB: React.FC<CostBreakdownFABProps> = ({ onClick, currency }) => {
  const Icon = getCurrencyIcon(currency);
  return (
    <Button onClick={onClick} className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20" size="icon">
      <Icon className="h-7 w-7" />
      <span className="sr-only">Open Cost Breakdown</span>
    </Button>
  );
};
