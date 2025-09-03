import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface DestinationData {
  description: string;
  latLng?: LatLng;
}

interface DestinationSearchProps {
  placeholder?: string;
  value?: string; // This might be just the description initially
  onChange?: (value: DestinationData) => void;
  className?: string;
  "data-testid"?: string;
}

export default function DestinationSearch({ placeholder, value = "", onChange, className, "data-testid": testId }: DestinationSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Explicitly define queryFn to ensure correct URL construction
  const fetchPlaces = async ({ queryKey }: { queryKey: any }) => {
    const [, params] = queryKey; // Extract parameters from the queryKey
    const input = params.input;

    if (!input) {
      return { suggestions: [] }; // Return empty if no input
    }
    
    // Using fetch API directly to control URL construction
    const response = await fetch("/api/places/autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: input }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const { data } = useQuery({
    queryKey: ["/api/places/autocomplete", { input: debouncedValue }],
    queryFn: fetchPlaces, // Use the custom fetcher
    enabled: debouncedValue.length > 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const suggestions = data?.predictions || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 2);
    // When input changes, we don't have latLng yet, so pass only description
    onChange?.({ description: newValue });
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const description = suggestion.description; 
    const latLng = suggestion.latLng;

    setInputValue(description);
    setShowSuggestions(false);
    onChange?.({ description, latLng });
  };

  const handleFocus = () => {
    if (inputValue.length > 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <Input
        data-testid={testId}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("w-full", className)}
      />
      
      {showSuggestions && (suggestions as any[]).length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto elevation-8">
          <div className="p-2">
            {(suggestions as any[]).map((suggestion: any, index: number) => (
              <div
                key={suggestion.place_id || index}
                className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                onClick={() => handleSelectSuggestion(suggestion)}
                data-testid={`suggestion-${index}`}
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </p>
                  {suggestion.structured_formatting?.secondary_text && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.structured_formatting.secondary_text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
