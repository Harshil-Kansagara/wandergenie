import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Wand2 } from "lucide-react";
import {
  tripPlanningSchema as baseTripPlanningSchema,
  type TripPlanningRequest,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DestinationSearch from "./destination-search";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/hooks/use-auth";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const tripPlanningSchema = baseTripPlanningSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true; // Pass validation if one of the dates is missing
  },
  { message: "End date must be after the start date", path: ["endDate"] }
);

interface TripFormProps {
  persona?: string;
  /** Determines if the form should be wrapped in its own Card component. Defaults to true. */
  renderInCard?: boolean;
  onClose?: () => void;
}

export default function TripForm({ persona, renderInCard = true }: Readonly<TripFormProps>) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const { t, language } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { user } = useAuth();

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  const form = useForm<TripPlanningRequest>({
    resolver: zodResolver(tripPlanningSchema),
    defaultValues: {
      destination: "",
      startDate: getTodayString(),
      endDate: "",
      budget: 5000,
      currency: currency, // This will be updated by useEffect
      theme: persona,
      groupSize: undefined,
      accommodation: "any",
      transport: "",
      language: language,
    },
  });

  // When the global language or currency changes (e.g., from geolocation or user selection),
  // reset the form to update its default values. This is more robust than using setValue.
  useEffect(() => {
    form.reset({
      ...form.getValues(), // Keep existing form values
      currency: currency,
      theme: persona, // Set theme from persona prop
      language: language,
    });
  }, [currency, language, form]);

  const generateItineraryMutation = useMutation({
    mutationFn: async (data: TripPlanningRequest) => {
      const response = await apiRequest("POST", "/api/ai/generate-itinerary", data);
      return response.json();
    },
    // Add retry logic here
    retry: 2, // Will retry up to 2 times on failure
    retryDelay: (attemptIndex) => {
      // Use exponential backoff for retries
      const delay = Math.pow(2, attemptIndex) * 1000; // 1s, 2s
      console.log(`Itinerary generation failed. Retrying in ${delay / 1000}s... (Attempt ${attemptIndex + 1})`);
      return delay;
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        // The generated itinerary data is in result.data
        const generatedTrip = result.data;

        // Invalidate any queries that might show old trip lists
        queryClient.invalidateQueries({ queryKey: ["trips"] });

        // Show a success message
        toast({
          title: t("itinerary_generated"),
          description: t("itinerary_generated_success"),
        });

        // Navigate to the itinerary page and pass the generated data in the state
        setLocation(`/itinerary/view`, { state: { trip: generatedTrip }, replace: true });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failed_to_generate_itinerary"),
        variant: "destructive",
      });
      // On error, navigate back to the previous page (the planner form)
      // The 'replace' option prevents the loading page from being in the history stack
      setLocation(window.history.state?.prev || "/", { replace: true });
    },
  });

  const onSubmit = (data: TripPlanningRequest) => {
    // Immediately navigate to the loading page
    setLocation("/generating-itinerary");
    generateItineraryMutation.mutate(data);
  };

  const FormContent = (
    <div>
        <p className="text-muted-foreground text-center mb-6">{t('ai_powered_planning_description')}</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('destination')}</FormLabel>
                  <FormControl>
                    <DestinationSearch
                      placeholder={t('where_want_to_go')}
                      value={field.value}
                      onChange={({ description }) => field.onChange(description)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('start_date')}</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('end_date')}</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('your_trip_budget')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="flex items-center space-x-2">
                  <span>{t('add_trip_preferences')}</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="groupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("group_size")}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t('group_size_solo')}</SelectItem>
                          <SelectItem value="2">{t('group_size_couple')}</SelectItem>
                          <SelectItem value="4">{t('group_size_family')}</SelectItem>
                          <SelectItem value="5">{t('group_size_group')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accommodation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('accommodation')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="luxury">{t('accommodation_luxury')}</SelectItem>
                          <SelectItem value="boutique">{t('accommodation_boutique')}</SelectItem>
                          <SelectItem value="hostel">{t('accommodation_hostel')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('transport')}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="public" id="public" />
                            </FormControl>
                            <FormLabel htmlFor="public">{t('transport_public')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="private" id="private" />
                            </FormControl>
                            <FormLabel htmlFor="private">{t('transport_private')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="rental" id="rental" />
                            </FormControl>
                            <FormLabel htmlFor="rental">{t('transport_rental')}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={generateItineraryMutation.isPending}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium hover:opacity-90 smooth-transition ripple-effect elevation-4"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {generateItineraryMutation.isPending ? t("generating") : t('generate_trip')}
              </Button>
            </div>
          </form>
        </Form>
    </div>
  );

  if (!renderInCard) {
    return FormContent;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-center mb-4">{t('create_your_perfect_trip')}</h2>
        {FormContent}
      </CardContent>
    </Card>
  );
}
