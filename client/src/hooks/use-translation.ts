import { useState, useEffect, useCallback } from 'react';
import { translationService, SUPPORTED_LANGUAGES, type Language } from '@/lib/translation';
import { useGeolocation } from './use-geolocation';

export interface TranslationState {
  language: string;
  isLoading: boolean;
  error: string | null;
  direction: 'ltr' | 'rtl';
}

export function useTranslation() {
  const { location } = useGeolocation();
  const [state, setState] = useState<TranslationState>({
    language: translationService.getCurrentLanguage(),
    isLoading: false,
    error: null,
    direction: translationService.getLanguageDirection(),
  });

  // Auto-detect language from location or browser
  useEffect(() => {
    const initializeLanguage = async () => {
      let targetLanguage = state.language;

      // Try to get saved preference
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage && translationService.isLanguageSupported(savedLanguage)) {
        targetLanguage = savedLanguage;
      }
      // Use detected location language
      else if (location?.language && translationService.isLanguageSupported(location.language)) {
        targetLanguage = location.language;
      }
      // Use browser language
      else {
        const browserLang = navigator.language.split('-')[0];
        if (translationService.isLanguageSupported(browserLang)) {
          targetLanguage = browserLang;
        }
      }

      if (targetLanguage !== state.language) {
        await setLanguage(targetLanguage);
      }
    };

    initializeLanguage();
  }, [location]);

  const setLanguage = useCallback(async (languageCode: string) => {
    if (!translationService.isLanguageSupported(languageCode)) {
      setState(prev => ({
        ...prev,
        error: `Language ${languageCode} is not supported`,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      await translationService.setLanguage(languageCode);
      setState(prev => ({
        ...prev,
        language: languageCode,
        direction: translationService.getLanguageDirection(languageCode),
        isLoading: false,
      }));

      // Save preference
      localStorage.setItem('preferred_language', languageCode);

      // Update document direction and lang attribute
      document.documentElement.dir = translationService.getLanguageDirection(languageCode);
      document.documentElement.lang = languageCode;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to change language',
        isLoading: false,
      }));
    }
  }, []);

  const t = useCallback((key: string, params?: { [key: string]: string }): string => {
    return translationService.translate(key, params);
  }, [state.language]);

  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions): string => {
    return translationService.formatNumber(number, options);
  }, [state.language]);

  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return translationService.formatDate(date, options);
  }, [state.language]);

  const getLanguageInfo = useCallback((languageCode?: string): Language | undefined => {
    return translationService.getLanguageInfo(languageCode || state.language);
  }, [state.language]);

  return {
    language: state.language,
    isLoading: state.isLoading,
    error: state.error,
    direction: state.direction,
    setLanguage,
    t,
    formatNumber,
    formatDate,
    getLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLanguageSupported: translationService.isLanguageSupported,
  };
}

// Hook for language detection and auto-switching
export function useLanguageDetection() {
  const { location } = useGeolocation();
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);

  useEffect(() => {
    if (!isAutoDetectEnabled) return;

    // Priority: saved preference > location language > browser language
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && translationService.isLanguageSupported(savedLanguage)) {
      setDetectedLanguage(savedLanguage);
      return;
    }

    if (location?.language && translationService.isLanguageSupported(location.language)) {
      setDetectedLanguage(location.language);
      return;
    }

    const browserLang = navigator.language.split('-')[0];
    if (translationService.isLanguageSupported(browserLang)) {
      setDetectedLanguage(browserLang);
      return;
    }

    setDetectedLanguage('en');
  }, [location, isAutoDetectEnabled]);

  return {
    detectedLanguage,
    isAutoDetectEnabled,
    setIsAutoDetectEnabled,
    hasDetectedLanguage: detectedLanguage !== 'en' || !!location?.language,
  };
}

// Hook for managing multiple language preferences
export function useLanguagePreferences() {
  const [primaryLanguage, setPrimaryLanguage] = useState<string>('en');
  const [fallbackLanguages, setFallbackLanguages] = useState<string[]>(['en']);

  useEffect(() => {
    const saved = localStorage.getItem('language_preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setPrimaryLanguage(preferences.primary || 'en');
        setFallbackLanguages(preferences.fallbacks || ['en']);
      } catch (error) {
        console.error('Failed to load language preferences:', error);
      }
    }
  }, []);

  const updatePreferences = useCallback((primary: string, fallbacks: string[] = ['en']) => {
    const validPrimary = translationService.isLanguageSupported(primary) ? primary : 'en';
    const validFallbacks = fallbacks.filter(lang => translationService.isLanguageSupported(lang));
    
    if (validFallbacks.length === 0) {
      validFallbacks.push('en');
    }

    setPrimaryLanguage(validPrimary);
    setFallbackLanguages(validFallbacks);

    localStorage.setItem('language_preferences', JSON.stringify({
      primary: validPrimary,
      fallbacks: validFallbacks,
    }));
  }, []);

  const addFallbackLanguage = useCallback((languageCode: string) => {
    if (translationService.isLanguageSupported(languageCode) && !fallbackLanguages.includes(languageCode)) {
      const newFallbacks = [...fallbackLanguages, languageCode];
      updatePreferences(primaryLanguage, newFallbacks);
    }
  }, [primaryLanguage, fallbackLanguages, updatePreferences]);

  const removeFallbackLanguage = useCallback((languageCode: string) => {
    if (languageCode !== 'en') { // Always keep English as fallback
      const newFallbacks = fallbackLanguages.filter(lang => lang !== languageCode);
      updatePreferences(primaryLanguage, newFallbacks);
    }
  }, [primaryLanguage, fallbackLanguages, updatePreferences]);

  return {
    primaryLanguage,
    fallbackLanguages,
    updatePreferences,
    addFallbackLanguage,
    removeFallbackLanguage,
  };
}

// Utility hook for RTL/LTR layout handling
export function useLayoutDirection() {
  const { direction } = useTranslation();

  const isRTL = direction === 'rtl';
  const isLTR = direction === 'ltr';

  // CSS class utilities
  const getDirectionClass = useCallback((rtlClass: string, ltrClass: string = '') => {
    return isRTL ? rtlClass : ltrClass;
  }, [isRTL]);

  // Margin/padding utilities for RTL
  const getMarginStart = useCallback((value: string) => {
    return isRTL ? `margin-right: ${value}` : `margin-left: ${value}`;
  }, [isRTL]);

  const getMarginEnd = useCallback((value: string) => {
    return isRTL ? `margin-left: ${value}` : `margin-right: ${value}`;
  }, [isRTL]);

  const getPaddingStart = useCallback((value: string) => {
    return isRTL ? `padding-right: ${value}` : `padding-left: ${value}`;
  }, [isRTL]);

  const getPaddingEnd = useCallback((value: string) => {
    return isRTL ? `padding-left: ${value}` : `padding-right: ${value}`;
  }, [isRTL]);

  return {
    direction,
    isRTL,
    isLTR,
    getDirectionClass,
    getMarginStart,
    getMarginEnd,
    getPaddingStart,
    getPaddingEnd,
  };
}
