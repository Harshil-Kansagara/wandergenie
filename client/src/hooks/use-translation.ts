import { useState, useEffect, useCallback } from "react";
import {
  translationService,
  SUPPORTED_LANGUAGES,
  type Language,
} from "@/lib/translation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGeolocation } from "./use-geolocation";

export interface TranslationState {
  language: string;
  isLoading: boolean;
  error: string | null;
  direction: "ltr" | "rtl";
}

/**
 * Methods and state for managing translations and localization.
 * @returns Methods and state for managing translations and localization.
 */
export function useTranslation() {
  const { location } = useGeolocation();
  const queryClient = useQueryClient();
  const [language, setLocalLanguage] = useState<string>(() => {
    const savedLanguage = localStorage.getItem("preferred_language");
    if (
      savedLanguage &&
      translationService.isLanguageSupported(savedLanguage)
    ) {
      return savedLanguage;
    }
    const browserLang = navigator.language.split("-")[0];
    if (translationService.isLanguageSupported(browserLang)) {
      return browserLang;
    }
    return "en";
  });

  const { isLoading, error, isSuccess } = useQuery({
    queryKey: ["translations", language],
    queryFn: () => translationService.setLanguage(language),
    // Keep translations fresh, but don't refetch too aggressively
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: true,
  });

  const setLanguage = useCallback(
    async (languageCode: string) => {
      if (!translationService.isLanguageSupported(languageCode)) {
        console.error(`Language ${languageCode} is not supported`);
        return;
      }
      setLocalLanguage(languageCode);
      localStorage.setItem("preferred_language", languageCode);
      document.documentElement.dir =
        translationService.getLanguageDirection(languageCode);
      document.documentElement.lang = languageCode;
      // Pre-fetch the new language's translations
      queryClient.prefetchQuery({
        queryKey: ["translations", languageCode],
        queryFn: () => translationService.setLanguage(languageCode),
      });
      window.location.reload();
    },
    [queryClient]
  );

  // Auto-detect language from location or browser
  useEffect(() => {
    // This effect runs when the location is detected.
    // If a language is detected from the location and no preferred language is saved,
    // update the current language.
    const savedLanguage = localStorage.getItem("preferred_language");
    if (!savedLanguage && location?.language) {
      const targetLanguage = location.language;
      if (translationService.isLanguageSupported(targetLanguage)) {
        setLanguage(targetLanguage);
      }
    }
  }, [location?.language, setLanguage]);

  const t = useCallback(
    (key: string, params?: { [key: string]: string }): string => {
      return translationService.translate(key, params);
    },
    [language]
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions): string => {
      return translationService.formatNumber(number, options);
    },
    [language]
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      return translationService.formatDate(date, options);
    },
    [language]
  );

  const getLanguageInfo = useCallback(
    (languageCode?: string): Language | undefined => {
      return translationService.getLanguageInfo(languageCode || language);
    },
    [language]
  );

  return {
    language: language,
    isLoading: isLoading || !isSuccess, // Report loading until the first fetch is successful
    error: error?.message ?? null,
    direction: translationService.getLanguageDirection(language),
    setLanguage,
    t,
    formatNumber,
    formatDate,
    getLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLanguageSupported: translationService.isLanguageSupported,
  };
}

/**
 * Methods to manage user's language preferences including primary and fallback languages.
 * @returns Methods to manage user's language preferences including primary and fallback languages.
 */
export function useLanguagePreferences() {
  const [primaryLanguage, setPrimaryLanguage] = useState<string>("en");
  const [fallbackLanguages, setFallbackLanguages] = useState<string[]>(["en"]);

  useEffect(() => {
    const saved = localStorage.getItem("language_preferences");
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setPrimaryLanguage(preferences.primary || "en");
        setFallbackLanguages(preferences.fallbacks || ["en"]);
      } catch (error) {
        console.error("Failed to load language preferences:", error);
      }
    }
  }, []);

  const updatePreferences = useCallback(
    (primary: string, fallbacks: string[] = ["en"]) => {
      const validPrimary = translationService.isLanguageSupported(primary)
        ? primary
        : "en";
      const validFallbacks = fallbacks.filter((lang) =>
        translationService.isLanguageSupported(lang)
      );

      if (validFallbacks.length === 0) {
        validFallbacks.push("en");
      }

      setPrimaryLanguage(validPrimary);
      setFallbackLanguages(validFallbacks);

      localStorage.setItem(
        "language_preferences",
        JSON.stringify({
          primary: validPrimary,
          fallbacks: validFallbacks,
        })
      );
    },
    []
  );

  const addFallbackLanguage = useCallback(
    (languageCode: string) => {
      if (
        translationService.isLanguageSupported(languageCode) &&
        !fallbackLanguages.includes(languageCode)
      ) {
        const newFallbacks = [...fallbackLanguages, languageCode];
        updatePreferences(primaryLanguage, newFallbacks);
      }
    },
    [primaryLanguage, fallbackLanguages, updatePreferences]
  );

  const removeFallbackLanguage = useCallback(
    (languageCode: string) => {
      if (languageCode !== "en") {
        // Always keep English as fallback
        const newFallbacks = fallbackLanguages.filter(
          (lang) => lang !== languageCode
        );
        updatePreferences(primaryLanguage, newFallbacks);
      }
    },
    [primaryLanguage, fallbackLanguages, updatePreferences]
  );

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

  const isRTL = direction === "rtl";
  const isLTR = direction === "ltr";

  // CSS class utilities
  const getDirectionClass = useCallback(
    (rtlClass: string, ltrClass: string = "") => {
      return isRTL ? rtlClass : ltrClass;
    },
    [isRTL]
  );

  // Margin/padding utilities for RTL
  const getMarginStart = useCallback(
    (value: string) => {
      return isRTL ? `margin-right: ${value}` : `margin-left: ${value}`;
    },
    [isRTL]
  );

  const getMarginEnd = useCallback(
    (value: string) => {
      return isRTL ? `margin-left: ${value}` : `margin-right: ${value}`;
    },
    [isRTL]
  );

  const getPaddingStart = useCallback(
    (value: string) => {
      return isRTL ? `padding-right: ${value}` : `padding-left: ${value}`;
    },
    [isRTL]
  );

  const getPaddingEnd = useCallback(
    (value: string) => {
      return isRTL ? `padding-left: ${value}` : `padding-right: ${value}`;
    },
    [isRTL]
  );

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
