import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft } from "lucide-react";
import TripForm from "@/components/trip-form";
import LanguageSelector from "@/components/language-selector";
import CurrencySelector from "@/components/currency-selector";
import { useTranslation } from "@/hooks/use-translation";

export default function Planner() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 elevation-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back')}
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">WanderAI</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <CurrencySelector />
              <Button data-testid="button-signin" className="bg-primary text-primary-foreground hover:opacity-90 smooth-transition">
                {t('sign_in')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="elevation-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('create_your_perfect_trip')}</CardTitle>
            <p className="text-muted-foreground text-center">{t('ai_powered_planning_description')}</p>
          </CardHeader>
          <CardContent>
            <TripForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
