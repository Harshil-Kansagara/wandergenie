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
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="elevation-4">
          <CardContent>
            <TripForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
