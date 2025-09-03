import { useState, useEffect, useCallback } from 'react';
import { currencyConverter, CURRENCIES, type CurrencyInfo } from '@/lib/currency';
import { useGeolocation } from './use-geolocation';

export interface CurrencyState {
  currency: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useCurrency() {
  const { location } = useGeolocation();
  const [state, setState] = useState<CurrencyState>({
    currency: 'USD',
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Initialize currency from localStorage or detected location
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency');
    if (savedCurrency && CURRENCIES.find(c => c.code === savedCurrency)) {
      setState(prev => ({ ...prev, currency: savedCurrency }));
    } else if (location && location.currency) {
      setState(prev => ({ ...prev, currency: location.currency }));
    }
  }, [location]);

  // Update exchange rates when currency changes
  useEffect(() => {
    const updateRates = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        await currencyConverter.ensureRatesLoaded();
        setState(prev => ({
          ...prev,
          isLoading: false,
          lastUpdated: currencyConverter.getLastUpdated(),
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to update exchange rates',
        }));
      }
    };

    updateRates();
  }, [state.currency]);

  const setCurrency = useCallback((newCurrency: string) => {
    if (CURRENCIES.find(c => c.code === newCurrency)) {
      setState(prev => ({ ...prev, currency: newCurrency }));
      localStorage.setItem('preferred_currency', newCurrency);
    }
  }, []);

  const convertCurrency = useCallback((amount: number, fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || state.currency;
    return currencyConverter.convert(amount, fromCurrency, targetCurrency);
  }, [state.currency]);

  const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
    const targetCurrency = currencyCode || state.currency;
    return currencyConverter.formatCurrency(amount, targetCurrency);
  }, [state.currency]);

  const getCurrencyInfo = useCallback((currencyCode?: string): CurrencyInfo | undefined => {
    const targetCurrency = currencyCode || state.currency;
    return currencyConverter.getCurrencyInfo(targetCurrency);
  }, [state.currency]);

  const getExchangeRate = useCallback((fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || state.currency;
    return currencyConverter.getRate(fromCurrency, targetCurrency);
  }, [state.currency]);

  const refreshRates = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await currencyConverter.updateRates();
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastUpdated: currencyConverter.getLastUpdated(),
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to refresh exchange rates',
      }));
    }
  }, []);

  return {
    currency: state.currency,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    setCurrency,
    convertCurrency,
    formatCurrency,
    getCurrencyInfo,
    getExchangeRate,
    refreshRates,
    availableCurrencies: CURRENCIES,
    isRateAvailable: (currencyCode: string) => currencyConverter.isRateAvailable(currencyCode),
  };
}

// Hook for currency conversion with live updates
export function useCurrencyConverter() {
  const { currency, convertCurrency, formatCurrency } = useCurrency();
  
  const convert = useCallback((amount: number, fromCurrency: string, toCurrency?: string) => {
    return convertCurrency(amount, fromCurrency, toCurrency);
  }, [convertCurrency]);

  const format = useCallback((amount: number, currencyCode?: string) => {
    return formatCurrency(amount, currencyCode);
  }, [formatCurrency]);

  const convertAndFormat = useCallback((amount: number, fromCurrency: string, toCurrency?: string) => {
    const converted = convert(amount, fromCurrency, toCurrency);
    return format(converted, toCurrency);
  }, [convert, format]);

  return {
    currency,
    convert,
    format,
    convertAndFormat,
  };
}

// Hook for price comparisons across currencies
export function usePriceComparison(baseCurrency: string = 'USD') {
  const { convertCurrency, formatCurrency } = useCurrency();

  const comparePrices = useCallback((amount: number, targetCurrencies: string[] = ['USD', 'EUR', 'GBP']) => {
    return targetCurrencies.map(currency => ({
      currency,
      amount: convertCurrency(amount, baseCurrency, currency),
      formatted: formatCurrency(convertCurrency(amount, baseCurrency, currency), currency),
    }));
  }, [convertCurrency, formatCurrency, baseCurrency]);

  return {
    comparePrices,
  };
}

// Utility hook for auto-detecting currency from location
export function useAutoDetectCurrency() {
  const { location } = useGeolocation();
  const [detectedCurrency, setDetectedCurrency] = useState<string>('USD');

  useEffect(() => {
    if (location && location.currency) {
      setDetectedCurrency(location.currency);
    }
  }, [location]);

  return {
    detectedCurrency,
    hasDetectedCurrency: !!location?.currency,
  };
}
