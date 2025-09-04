import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bed, Plane, Train, Car, CreditCard, Shield, CheckCircle, Wallet } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslation } from "@/hooks/use-translation";

const bookingSchema = z.object({
  accommodation: z.string().min(1, "Please select accommodation"),
  transport: z.string().min(1, "Please select transportation"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string().regex(/^\d{2}$/, "Invalid year"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
  travelInsurance: z.boolean().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFlowProps {
  trip: any;
}

export default function BookingFlow({ trip }: BookingFlowProps) {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const [bookingStep, setBookingStep] = useState<'selection' | 'payment' | 'confirmation'>('selection');

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      accommodation: "",
      transport: "",
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      travelInsurance: false,
    },
  });

  const accommodationOptions = [
    {
      id: "luxury",
      name: "The Oberoi Hotel",
      type: "Luxury Hotel",
      location: "City Center",
      rating: 4.8,
      price: 8500,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=80&fit=crop"
    },
    {
      id: "boutique",
      name: "Heritage Boutique",
      type: "Boutique Hotel", 
      location: "Historic District",
      rating: 4.6,
      price: 6200,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=120&h=80&fit=crop"
    }
  ];

  const transportOptions = [
    {
      id: "flight",
      name: "Flight + Private Car",
      description: "Fastest & most comfortable",
      price: 12500,
      icon: Plane
    },
    {
      id: "train",
      name: "Train + Taxi",
      description: "Scenic & economical",
      price: 4800,
      icon: Train
    },
    {
      id: "road",
      name: "Private Car",
      description: "Flexible schedule",
      price: 7200,
      icon: Car
    }
  ];

  const confirmBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingFormData) => {
      // First create a mock payment intent
      const paymentIntent = await apiRequest("POST", "/api/create-payment-intent", {
        amount: calculateTotal(),
        currency: trip.currency,
      });
      const paymentData = await paymentIntent.json();
      
      // Mock payment confirmation
      const paymentConfirmation = await apiRequest("POST", "/api/confirm-payment", {
        payment_intent_id: paymentData.id,
        payment_method: {
          card: {
            number: bookingData.cardNumber,
            exp_month: bookingData.expiryMonth,
            exp_year: bookingData.expiryYear,
            cvc: bookingData.cvv,
          },
        },
      });
      
      // Create booking after successful payment
      const response = await apiRequest("POST", "/api/bookings", {
        tripId: trip.id,
        userId: "user-1", // Mock user ID
        type: "complete_trip",
        provider: "WanderAI",
        details: bookingData,
        amount: calculateTotal(),
        currency: trip.currency,
        status: "confirmed",
        paymentReference: paymentData.id,
      });
      return response.json();
    },
    onSuccess: () => {
      setBookingStep('confirmation');
      toast({
        title: t("booking_confirmed"),
        description: t("booking_confirmation_sent"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("booking_failed"),
        description: error.message || t("please_try_again"),
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    const selectedAccommodation = accommodationOptions.find(opt => opt.id === form.getValues("accommodation"));
    const selectedTransport = transportOptions.find(opt => opt.id === form.getValues("transport"));
    const insuranceCost = form.getValues("travelInsurance") ? 2400 : 0;
    
    const baseTotal = parseInt(trip.itinerary?.totalCost|| '0');
    const accommodationCost = selectedAccommodation ? selectedAccommodation.price * 7 : 0; // 7 nights
    const transportCost = selectedTransport ? selectedTransport.price : 0;
    
    return baseTotal + accommodationCost + transportCost + insuranceCost;
  };

  const onSubmit = (data: BookingFormData) => {
    if (bookingStep === 'selection') {
      setBookingStep('payment');
    } else if (bookingStep === 'payment') {
      confirmBookingMutation.mutate(data);
    }
  };

  if (bookingStep === 'confirmation') {
    return (
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="elevation-8">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-booking-confirmed">
                {t("booking_confirmed")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("booking_confirmation_details")}
              </p>
              <div className="bg-secondary/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-secondary-foreground">
                  <strong>{t("booking_reference")}:</strong> WA-{Date.now().toString().slice(-8)}
                </p>
                <p className="text-sm text-secondary-foreground">
                  <strong>{t("total_amount")}:</strong> {formatCurrency(calculateTotal(), trip.currency)}
                </p>
              </div>
              <Button 
                className="bg-primary text-primary-foreground px-8 py-3"
                data-testid="button-view-booking"
              >
                {t("view_booking_details")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t("complete_booking")}</h2>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant={bookingStep === 'selection' ? 'default' : 'secondary'}>
              1. {t("selection")}
            </Badge>
            <Badge variant={bookingStep === 'payment' ? 'default' : 'secondary'}>
              2. {t("payment")}
            </Badge>
            <Badge variant="secondary">
              3. {t("confirmation")}
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Details */}
              <div className="space-y-6">
                {bookingStep === 'selection' && (
                  <>
                    {/* Accommodation Selection */}
                    <Card className="elevation-2">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Bed className="h-5 w-5 mr-2 text-primary" />
                          {t("accommodation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="accommodation"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup value={field.value} onValueChange={field.onChange}>
                                  {accommodationOptions.map((option) => (
                                    <div key={option.id} className="border border-border rounded-lg p-4 hover:border-primary smooth-transition">
                                      <div className="flex items-center space-x-4">
                                        <RadioGroupItem value={option.id} data-testid={`radio-accommodation-${option.id}`} />
                                        <img 
                                          src={option.image} 
                                          alt={option.name}
                                          className="w-20 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                          <h4 className="font-medium text-foreground">{option.name}</h4>
                                          <p className="text-sm text-muted-foreground">{option.location} • {option.rating}★</p>
                                          <p className="text-sm text-secondary font-medium">
                                            {formatCurrency(option.price, trip.currency)}/night
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Transportation Selection */}
                    <Card className="elevation-2">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Plane className="h-5 w-5 mr-2 text-primary" />
                          {t("transportation")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="transport"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup value={field.value} onValueChange={field.onChange}>
                                  {transportOptions.map((option) => (
                                    <div key={option.id} className="border border-border rounded-lg p-4 hover:border-primary smooth-transition">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <RadioGroupItem value={option.id} data-testid={`radio-transport-${option.id}`} />
                                          <option.icon className="h-5 w-5 text-primary" />
                                          <div>
                                            <p className="font-medium text-foreground">{option.name}</p>
                                            <p className="text-sm text-muted-foreground">{option.description}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium text-secondary">
                                            {formatCurrency(option.price, trip.currency)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}

                {bookingStep === 'payment' && (
                  <>
                    {/* Payment Form */}
                    <Card className="elevation-2">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <CreditCard className="h-5 w-5 mr-2 text-primary" />
                          {t("payment_details")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="cardholderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("cardholder_name")}</FormLabel>
                              <FormControl>
                                <Input 
                                  data-testid="input-cardholder-name"
                                  placeholder={t("enter_full_name")} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("card_number")}</FormLabel>
                              <FormControl>
                                <Input 
                                  data-testid="input-card-number"
                                  placeholder="1234 5678 9012 3456" 
                                  maxLength={16}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryMonth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("month")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    data-testid="input-expiry-month"
                                    placeholder="MM" 
                                    maxLength={2}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="expiryYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("year")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    data-testid="input-expiry-year"
                                    placeholder="YY" 
                                    maxLength={2}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("cvv")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    data-testid="input-cvv"
                                    placeholder="123" 
                                    maxLength={4}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Payment Methods */}
                        <div className="pt-4">
                          <p className="text-sm font-medium text-muted-foreground mb-3">{t("other_payment_options")}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Button type="button" variant="outline" className="h-12">
                              <Wallet className="h-5 w-5" />
                            </Button>
                            <Button type="button" variant="outline" className="h-12">
                              💳
                            </Button>
                            <Button type="button" variant="outline" className="h-12">
                              🏦
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Travel Insurance */}
                    <Card className="elevation-2">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Shield className="h-5 w-5 mr-2 text-secondary" />
                          {t("travel_protection")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="travelInsurance"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <p className="font-medium text-foreground">{t("comprehensive_travel_insurance")}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t("trip_cancellation_medical_baggage")}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-secondary">
                                  {formatCurrency(2400, trip.currency)}
                                </span>
                                <FormControl>
                                  <Checkbox
                                    data-testid="checkbox-travel-insurance"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                {/* Booking Summary */}
                <Card className="elevation-4 sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-xl">{t("booking_summary")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("base_itinerary")}</span>
                        <span className="font-medium" data-testid="text-base-cost">
                          {formatCurrency(parseInt(trip.itinerary?.totalCost || '0'), trip.currency)}
                        </span>
                      </div>
                      
                      {form.watch("accommodation") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("accommodation")} (7 nights)</span>
                          <span className="font-medium" data-testid="text-accommodation-cost">
                            {formatCurrency(accommodationOptions.find(opt => opt.id === form.watch("accommodation"))!.price * 7, trip.currency)}
                          </span>
                        </div>
                      )}
                      
                      {form.watch("transport") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("transportation")}</span>
                          <span className="font-medium" data-testid="text-transport-cost">
                            {formatCurrency(transportOptions.find(opt => opt.id === form.watch("transport"))!.price, trip.currency)}
                          </span>
                        </div>
                      )}
                      
                      {form.watch("travelInsurance") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("travel_insurance")}</span>
                          <span className="font-medium" data-testid="text-insurance-cost">
                            {formatCurrency(2400, trip.currency)}
                          </span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">{t("total_amount")}</span>
                        <span className="font-bold text-primary text-xl" data-testid="text-final-total">
                          {formatCurrency(calculateTotal(), trip.currency)}
                        </span>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={confirmBookingMutation.isPending}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 smooth-transition"
                      data-testid="button-proceed-booking"
                    >
                      {confirmBookingMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                          <span>{t("processing")}</span>
                        </div>
                      ) : (
                        bookingStep === 'selection' ? t("proceed_to_payment") : t("confirm_booking")
                      )}
                    </Button>

                    {bookingStep === 'payment' && (
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setBookingStep('selection')}
                        className="w-full"
                        data-testid="button-back-to-selection"
                      >
                        {t("back_to_selection")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
