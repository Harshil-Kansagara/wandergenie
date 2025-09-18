import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Bed, Utensils, TramFront, Ticket, Wand2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trip } from '@shared/schema';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useCurrency } from '@/hooks/use-currency';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface CostBreakdownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Trip;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];
const CATEGORY_ICONS = {
  accommodation: <Bed className="h-4 w-4 mr-2" />,
  food: <Utensils className="h-4 w-4 mr-2" />,
  transport: <TramFront className="h-4 w-4 mr-2" />,
  activities: <Ticket className="h-4 w-4 mr-2" />,
  miscellaneous: <DollarSign className="h-4 w-4 mr-2" />,
};

export const CostBreakdownPanel: React.FC<CostBreakdownPanelProps> = ({ isOpen, onClose, itinerary }) => {
  const { formatCurrency } = useCurrency();
  const { costBreakdown, currency, itinerary: tripItinerary } = itinerary;
  const [adjustableBudget, setAdjustableBudget] = useState(itinerary.budget);

  useEffect(() => {
    // Reset the adjustable budget if the panel is re-opened with a different itinerary
    if (isOpen) {
      setAdjustableBudget(itinerary.budget);
    }
  }, [isOpen, itinerary.budget]);

  if (!costBreakdown) return null;

  const totalSpent = parseFloat(costBreakdown.total ?? '0');
  const budgetAmount = adjustableBudget ?? 0;
  const budgetProgress = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
  const budgetDifference = budgetAmount - totalSpent;

  const handleReplanClick = () => {
    // In a real app, you would trigger a mutation here, e.g.:
    // replanMutation.mutate({ ...itinerary, budget: adjustableBudget });
    console.log(`Re-planning trip with new budget: ${adjustableBudget}`);
    onClose(); // Close panel after initiating re-plan
  };

  const chartData = Object.entries(costBreakdown)
    .filter(([key, value]) => typeof value === 'number' && value > 0 && !['total', 'isOverBudget', 'overageAmount'].includes(key))
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
    }));

  const dailyCosts = tripItinerary?.days.map(day => {
    const dailyTotal = day.activities.reduce((sum, activity) => {
      const cost = parseFloat(String(activity.approximateCost).replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);
    return { day: day.day, total: dailyTotal };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl z-50 flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Cost Breakdown</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </header>

            <ScrollArea className="flex-grow">
              <div className="p-6 space-y-8">
                {/* Budget Summary */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Budget Summary</h3>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-muted-foreground">Amount Spent</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalSpent, currency)}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm mb-2">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span>{formatCurrency(budgetAmount, currency)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <Separator />

                {/* Interactive Budget Adjustment */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Adjust Your Budget</h3>
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Your New Budget</h4>
                      <Input
                        type="number"
                        value={adjustableBudget}
                        onChange={(e) => setAdjustableBudget(Number(e.target.value))}
                        className="w-32"
                      />
                    </div>
                    <Slider
                      value={[adjustableBudget]}
                      onValueChange={(value) => setAdjustableBudget(value[0])}
                      max={itinerary.budget * 2} // Allow doubling the original budget
                      step={100}
                    />
                    <div className="text-center text-sm">
                      {budgetDifference >= 0 ? (
                        <p className="text-green-600">{formatCurrency(budgetDifference, currency)} under new budget</p>
                      ) : (
                        <p className="text-red-600">{formatCurrency(Math.abs(budgetDifference), currency)} over new budget</p>
                      )}
                    </div>
                    <Button onClick={handleReplanClick} className="w-full" variant="secondary">
                      <Wand2 className="mr-2 h-4 w-4" /> Re-plan with New Budget
                    </Button>
                  </div>
                </div>

                {/* Visual Breakdown */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Category Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {chartData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORS[chartData.indexOf(entry) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Breakdown */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Daily Costs</h3>
                  <div className="space-y-2 rounded-lg border p-4">
                    {dailyCosts?.map(item => (
                      <div key={item.day} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Day {item.day}</span>
                        <span className="font-medium">{formatCurrency(item.total, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
