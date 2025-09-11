import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

const messages = [
  "Consulting the stars for your adventure...",
  "Packing your virtual bags...",
  "Chatting with local guides...",
  "Finding the best photo spots...",
  "Polishing hidden gems...",
  "Crafting your unique story...",
];

export default function GeneratingItineraryPage() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500); // Change message every 2.5 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const message = messages[messageIndex];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="pt-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Wand2 className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Crafting Your Itinerary</h1>
          <p className="mt-2 text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
