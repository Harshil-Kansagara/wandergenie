import { useState } from "react";
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
import { tripPlanningSchema, type TripPlanningRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DestinationSearch from "./destination-search";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslation } from "@/hooks/use-translation";

interface TripFormProps {
  onClose?: () => void;
}

export default function TripForm({ onClose }: TripFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<TripPlanningRequest>({
    resolver: zodResolver(tripPlanningSchema),
    defaultValues: {
      destination: "",
      startDate: "",
      endDate: "",
      budget: 5000,
      currency: currency,
      theme: "culture",
      groupSize: 2,
      accommodation: "",
      transport: "",
      language: "en",
    },
  });

  const generateItineraryMutation = useMutation({
    mutationFn: async (data: TripPlanningRequest) => {
      const response = await apiRequest("POST", "/api/generate-itinerary", data);
      return response.json();
    },
    onSuccess: async (result) => {
      if (result.success) {
        const tripData = {
          userId: "user-1",
          title: result.data.title,
          destination: form.getValues("destination"),
          destinationLatLng: result.data.destinationLatLng,
          startDate: form.getValues("startDate"),
          endDate: form.getValues("endDate"),
          budget: form.getValues("budget"),
          currency: form.getValues("currency"),
          theme: form.getValues("theme"),
          groupSize: form.getValues("groupSize"),
          accommodation: form.getValues("accommodation"),
          transport: form.getValues("transport"),
          itinerary: result.data,
          costBreakdown: result.data.costBreakdown,
          status: "draft",
        };

        const tripResponse = await apiRequest("POST", "/api/trips", tripData);
        const trip = await tripResponse.json();

        queryClient.invalidateQueries({ queryKey: ["/api/trips"] });

        toast({
          title: t("itinerary_generated"),
          description: t("itinerary_generated_success"),
        });

        setLocation(`/itinerary/${trip.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || t("failed_to_generate_itinerary"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TripPlanningRequest) => {
    generateItineraryMutation.mutate(data);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6 lg:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="floating-input smooth-transition">
                    <FormLabel>{t("destination_worldwide")}</FormLabel>
                    <FormControl>
                      <DestinationSearch
                        data-testid="input-trip-destination"
                        placeholder={t("where_want_to_go")}
                        value={field.value}
                        onChange={({ description }) => field.onChange(description)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="floating-input smooth-transition">
                    <FormLabel>{t("check_in")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="floating-input smooth-transition">
                    <FormLabel>{t("check_out")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("budget_range")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="100"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("travel_theme")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_theme")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="heritage">{t("heritage_culture")}</SelectItem>
                        <SelectItem value="adventure">{t("adventure_trekking")}</SelectItem>
                        <SelectItem value="nightlife">{t("nightlife_entertainment")}</SelectItem>
                        <SelectItem value="spiritual">{t("spiritual_wellness")}</SelectItem>
                        <SelectItem value="food">{t("food_culinary")}</SelectItem>
                        <SelectItem value="beach">{t("beach_relaxation")}</SelectItem>
                        <SelectItem value="culture">{t("culture_museums")}</SelectItem>
                        <SelectItem value="nature">{t("nature_wildlife")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="flex items-center space-x-2">
                  <span>{t("advanced_options")}</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("group_size")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accommodation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("accommodation")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("any")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">{t("budget")}</SelectItem>
                            <SelectItem value="mid-range">{t("mid_range")}</SelectItem>
                            <SelectItem value="luxury">{t("luxury")}</SelectItem>
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
                        <FormLabel>{t("transport")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("mixed")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="flight">{t("flight_preferred")}</SelectItem>
                            <SelectItem value="train">{t("train_preferred")}</SelectItem>
                            <SelectItem value="road">{t("road_trip")}</SelectItem>
                            <SelectItem value="mixed">{t("mixed")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-center pt-4 space-x-4">
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("cancel")}
                </Button>
              )}
              <Button
                type="submit"
                disabled={generateItineraryMutation.isPending}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium hover:opacity-90 smooth-transition ripple-effect elevation-4"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                {generateItineraryMutation.isPending ? t("generating") : t("generate_ai_itinerary")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
