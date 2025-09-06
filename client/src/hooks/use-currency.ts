import { useState, useEffect, useCallback } from "react";
import {
  currencyConverter,
  currencyApi,
  CURRENCIES,
  type CurrencyInfo,
} from "@/lib/currency";
import { useGeolocation } from "./use-geolocation";
import { useQuery } from "@tanstack/react-query";

export interface CurrencyState {
  currency: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useCurrency() {
  const { location } = useGeolocation();

  // Use React Query to fetch and cache the exchange rates
  const {
    data: ratesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: () => currencyApi.getExchangeRates("USD"),
    staleTime: 60 * 60 * 1000, // 1 hour
    initialData: () => {
      const cachedRates = localStorage.getItem("currency_rates");
      if (cachedRates) {
        try {
          const data = JSON.parse(cachedRates);
          // Optional: Check if the cached data is too old
          if (
            Date.now() - new Date(data.timestamp).getTime() <
            60 * 60 * 1000
          ) {
            return data;
          }
        } catch (e) {
          console.error("Failed to parse cached currency rates:", e);
        }
      }
      return undefined;
    },
  });

  // Local state for the user's selected currency
  const [currency, setLocalCurrency] = useState<string>(() => {
    const savedCurrency = localStorage.getItem("preferred_currency");
    if (savedCurrency && CURRENCIES.find((c) => c.code === savedCurrency)) {
      return savedCurrency;
    }
    // Note: location is not available on initial render, so we use a useEffect for that.
    return "USD";
  });

  // Initialize currency from localStorage or detected location
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferred_currency");
    // Only set from location if there's no saved preference
    if (!savedCurrency && location?.currency) {
      setLocalCurrency(location.currency);
    }
  }, [location?.currency]);

  // Update the singleton converter when rates are fetched
  useEffect(() => {
    if (ratesData) {
      currencyConverter.setRates(ratesData.rates, ratesData.base);
    }

    localStorage.setItem("currency_rates", JSON.stringify(ratesData));
  }, [ratesData]);

  const setCurrency = useCallback((newCurrency: string) => {
    if (CURRENCIES.find((c) => c.code === newCurrency)) {
      setLocalCurrency(newCurrency);
      localStorage.setItem("preferred_currency", newCurrency);
    }
  }, []);

  const convertCurrency = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string): number => {
      const targetCurrency = toCurrency || currency;
      return currencyConverter.convert(amount, fromCurrency, targetCurrency);
    },
    [currency]
  );

  const formatCurrency = useCallback(
    (amount: number, currencyCode?: string): string => {
      const targetCurrency = currencyCode || currency;
      return currencyConverter.formatCurrency(amount, targetCurrency);
    },
    [currency]
  );

  const getCurrencyInfo = useCallback(
    (currencyCode?: string): CurrencyInfo | undefined => {
      const targetCurrency = currencyCode || currency;
      return currencyConverter.getCurrencyInfo(targetCurrency);
    },
    [currency]
  );

  const getExchangeRate = useCallback(
    (fromCurrency: string, toCurrency?: string): number => {
      const targetCurrency = toCurrency || currency;
      return currencyConverter.getRate(fromCurrency, targetCurrency);
    },
    [currency]
  );

  return {
    currency: currency,
    isLoading,
    error: error?.message ?? null,
    lastUpdated: ratesData ? new Date(ratesData.timestamp) : null,
    setCurrency,
    convertCurrency,
    formatCurrency,
    getCurrencyInfo,
    getExchangeRate,
    refreshRates: refetch,
    availableCurrencies: ratesData
      ? CURRENCIES.filter((currency) =>
          Object.hasOwn(ratesData.rates, currency.code)
        )
      : // Provide a default list while loading
        CURRENCIES,
    isRateAvailable: (currencyCode: string) =>
      currencyConverter.isRateAvailable(currencyCode),
  };
}

// Hook for currency conversion with live updates
export function useCurrencyConverter() {
  const { currency, convertCurrency, formatCurrency } = useCurrency();

  const convertAndFormat = useCallback(
    (amount: number, fromCurrency: string, toCurrency?: string) => {
      const targetCurrency = toCurrency || currency;
      const converted = convertCurrency(amount, fromCurrency, targetCurrency);
      return formatCurrency(converted, targetCurrency);
    },
    [convertCurrency, formatCurrency, currency]
  );

  return {
    currency,
    convert: convertCurrency,
    format: formatCurrency,
    convertAndFormat,
  };
}

// Hook for price comparisons across currencies
export function usePriceComparison(baseCurrency: string = "USD") {
  const { convertCurrency, formatCurrency, currency } = useCurrency();

  const comparePrices = useCallback(
    (amount: number, targetCurrencies: string[] = ["USD", "EUR", "GBP"]) => {
      return targetCurrencies.map((currency) => ({
        currency,
        amount: convertCurrency(amount, baseCurrency, currency),
        formatted: formatCurrency(
          convertCurrency(amount, baseCurrency, currency),
          currency
        ),
      }));
    },
    [convertCurrency, formatCurrency, baseCurrency, currency]
  );

  return {
    comparePrices,
  };
}

// Utility hook for auto-detecting currency from location
export function useAutoDetectCurrency() {
  const { location } = useGeolocation();
  const [currency, setCurrency] = useState<string>("USD");

  useEffect(() => {
    if (location?.currency) {
      setCurrency(location.currency);
    }
  }, [location]);

  return {
    detectedCurrency: currency,
    hasDetectedCurrency: !!location?.currency,
  };
}
