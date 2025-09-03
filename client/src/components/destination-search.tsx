import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

interface DestinationSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
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

  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/places/autocomplete", { input: debouncedValue }],
    enabled: debouncedValue.length > 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 2);
    onChange?.(newValue);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    onChange?.(suggestion.description);
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
