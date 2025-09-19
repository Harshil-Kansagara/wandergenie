import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { t } from "@/lib/translation";


const messageKeys = [
  "generating_message_1",
  "generating_message_2",
  "generating_message_3",
  "generating_message_4",
  "generating_message_5",
  "generating_message_6",
];

export default function GeneratingItineraryPage() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messageKeys.length);
    }, 2500); // Change message every 2.5 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

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
          <h1 className="text-2xl font-bold text-foreground">{t("crafting_itinerary")}</h1>
          <p className="mt-2 text-muted-foreground">{t(messageKeys[messageIndex])}</p>
        </CardContent>
      </Card>
    </div>
  );
}
