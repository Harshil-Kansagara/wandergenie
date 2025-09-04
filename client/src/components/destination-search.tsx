import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface DestinationData {
  description: string;
  latLng?: LatLng;
}

interface DestinationSearchProps {
  placeholder?: string;
  value?: string; 
  onChange?: (value: DestinationData) => void;
  className?: string;
  "data-testid"?: string;
}

export default function DestinationSearch({ placeholder, value = "", onChange, className, "data-testid": testId }: DestinationSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");

  // Synchronize internal input value with external value prop
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const fetchPlacesAutocomplete = async ({ queryKey }: { queryKey: any }) => {
    const [, params] = queryKey;
    const input = params;
    
    if (!input) {
      return { predictions: [] };
    }
    
    try {
     
      const inputData={input};
      const response = await apiRequest("POST", "/api/places/autocomplete", inputData);
      const jsonResponse = await response.json();
      console.log(jsonResponse)
      return jsonResponse;
    } catch (error) {
      console.error("Error in fetchPlacesAutocomplete API request:", error);
      throw error;
    }
  };

  const { data } = useQuery({
    queryKey: ["placesAutocomplete", debouncedValue],
    queryFn: fetchPlacesAutocomplete,
    enabled: debouncedValue.length > 2,
    staleTime: 5 * 60 * 1000,
  });

  const suggestions = data?.predictions || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 2);
    onChange?.({ description: newValue, latLng: undefined }); 
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
