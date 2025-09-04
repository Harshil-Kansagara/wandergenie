import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Star, Globe, Calendar, Users, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TripForm from "@/components/trip-form";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();

  const { data: popularDestinations, isLoading: isLoadingDestinations } = useQuery({
    queryKey: ["/api/destinations/popular"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const testimonials = [
    {
      content: "WanderAI created the perfect heritage tour for us. The AI recommendations were spot-on and saved us hours of planning!",
      author: "Priya Sharma",
      location: "Mumbai",
      rating: 5
    },
    {
      content: "The real-time weather adjustments saved our Goa trip. AI suggested indoor activities when it rained - brilliant!",
      author: "Anjali Verma",
      location: "Bangalore",
      rating: 5
    },
    {
      content: "From booking to payment, everything was seamless. The multilingual support helped our entire family plan together.",
      author: "Rajesh Kumar",
      location: "Chennai",
      rating: 5
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white py-20 lg:py-32">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&h=1380')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {t('discover_world_with_ai')}
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {t('ai_craft_perfect_adventure')}
            </p>
          </div>

          {/* Trip Planning Form */}
          <div className="max-w-4xl mx-auto">
            <TripForm />
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('trending_destinations')}</h2>
            <p className="text-lg text-muted-foreground">{t('discover_popular_experiences')}</p>
          </div>

          {isLoadingDestinations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-xl" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-3 w-2/3" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-20" />
                      <div className="h-3 bg-muted rounded w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(popularDestinations as any[])?.map((destination: any) => (
                <Card key={destination.id} className="overflow-hidden elevation-2 hover:elevation-4 smooth-transition group cursor-pointer">
                  <div 
                    className="h-48 bg-cover bg-center group-hover:scale-105 smooth-transition"
                    style={{ backgroundImage: `url(${destination.imageUrl})` }}
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2" data-testid={`text-destination-${destination.id}`}>
                      {destination.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{destination.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-secondary font-medium">From {destination.currency} {destination.averageCost}</span>
                      <div className="flex items-center space-x-1 text-accent">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm">{(destination.rating / 10).toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">50,000+</div>
              <p className="text-muted-foreground">{t('trips_planned')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-secondary mb-2">25,000+</div>
              <p className="text-muted-foreground">{t('happy_travelers')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">4.9</div>
              <p className="text-muted-foreground">{t('average_rating')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">200+</div>
              <p className="text-muted-foreground">{t('destinations')}</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="elevation-2">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 text-accent mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">WanderAI</span>
              </div>
              <p className="text-background/80 mb-4">AI-powered travel planning for unforgettable global experiences.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('destinations')}</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background smooth-transition">Europe</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Asia</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Americas</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Africa</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Oceania</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('services')}</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background smooth-transition">AI Trip Planning</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Hotel Booking</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Flight Booking</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Experience Booking</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Travel Insurance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('support')}</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="#" className="hover:text-background smooth-transition">Help Center</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background smooth-transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60 text-sm">&copy; 2024 WanderAI. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-background/60 text-sm">🌍 Global Travel Planning</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          data-testid="button-chat"
          className="bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-xl hover:opacity-90 smooth-transition"
        >
          💬
        </Button>
      </div>
    </>
  );
}
