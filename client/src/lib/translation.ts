export interface TranslationStrings {
  [key: string]: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
];

// Translation cache
const translationCache = new Map<string, TranslationStrings>();

export class TranslationService {
  private currentLanguage: string = "en";
  private translations: TranslationStrings = {};
  private  fallbackTranslations: TranslationStrings = {};

  /**
   * Initializes the service with the user's preferred or detected language.
   * This should be called once when the application loads.
   */
  async init(): Promise<void> {
    await this.loadTranslations("en", true);
    const savedLanguage = localStorage.getItem("preferred_language");
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      await this.setLanguage(savedLanguage);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (this.isLanguageSupported(browserLang)) {
        await this.setLanguage(browserLang);
      } else {
        await this.setLanguage("en");
      }
    }
  }


  isLanguageSupported(languageCode: string): boolean {
    return SUPPORTED_LANGUAGES.some((lang) => lang.code === languageCode);
  }

  async setLanguage(languageCode: string): Promise<TranslationStrings> {
    if (!this.isLanguageSupported(languageCode)) {
      console.warn(
        `Language ${languageCode} is not supported. Falling back to English.`
      );
      return this.fallbackTranslations;
    }

    this.currentLanguage = languageCode;

    if (languageCode === "en") {
      this.translations = this.fallbackTranslations;
      return this.translations;
    }

    // Check cache first
    if (translationCache.has(languageCode)) {
      this.translations = translationCache.get(languageCode)!;
      return this.translations;
    }

    try {
      // Try to load translations from API or generate them
      const translations = await this.loadTranslations(languageCode);
      this.translations = {
        ...this.fallbackTranslations,
        ...translations,
      };
      translationCache.set(languageCode, this.translations);
      // Cache in localStorage for offline use
      localStorage.setItem(
        `translations_${languageCode}`,
        JSON.stringify(this.translations)
      );
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);

      // Try to load from localStorage cache
      try {
        const cached = localStorage.getItem(`translations_${languageCode}`);
        if (cached) {
          this.translations = JSON.parse(cached);
          translationCache.set(languageCode, this.translations);
        }
      } catch (cacheError) {
        console.error("Failed to load cached translations:", cacheError);
        // Fall back to English
        this.translations = this.fallbackTranslations;
      }
    }

    return this.translations;
  }

  /**
   * Manually sets the translations for a given language.
   * This is useful when fetching translations from an external source like React Query.
   * @param translations - The translation strings to set.
   * @param languageCode - The language code for the translations.
   */
  setTranslations(translations: TranslationStrings, languageCode: string) {
    this.translations = { ...this.fallbackTranslations, ...translations };
    this.currentLanguage = languageCode;
    translationCache.set(languageCode, this.translations);
  }


  /**
   * Loads translations for a given language from a JSON file.
   * @param languageCode The language code (e.g., "es", "fr").
   * @param isFallback A flag to determine if this is the fallback language.
   * @returns A promise that resolves to the translation strings.
   */
  async loadTranslations(languageCode: string, isFallback: boolean = false): Promise<TranslationStrings> {
    try {
      const translations = await import(`@/locales/${languageCode}.json`);
      if (isFallback) {
        this.fallbackTranslations = translations.default || translations;
      }
      return translations.default || translations;
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);
      return {};
    }
  }

  translate(key: string, params?: { [key: string]: string }): string {
    let translation =
      this.translations[key] || this.fallbackTranslations[key] || key;

    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(
          new RegExp(`{{${param}}}`, "g"),
          value
        );
      });
    }

    return translation;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  getLanguageInfo(languageCode: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);
  }

  // Utility method to get language direction (for RTL languages)
  getLanguageDirection(languageCode?: string): "ltr" | "rtl" {
    const lang = languageCode || this.currentLanguage;
    const rtlLanguages = ["ar", "he", "fa", "ur"];
    return rtlLanguages.includes(lang) ? "rtl" : "ltr";
  }

  // Format numbers according to locale
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.getLocale();
    return new Intl.NumberFormat(locale, options).format(number);
  }

  // Format dates according to locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.getLocale();
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  private getLocale(): string {
    const langInfo = this.getLanguageInfo(this.currentLanguage);
    if (!langInfo) return "en-US";

    // Map language codes to locales
    const localeMap: { [key: string]: string } = {
      en: "en-US",
      hi: "hi-IN",
      pa: "pa-IN",
      bn: "bn-IN",

    };

    return localeMap[this.currentLanguage] || "en-US";
  }
}

// Create singleton instance
export const translationService = new TranslationService();

// Utility function for quick translations
export function t(key: string, params?: { [key: string]: string }): string {
  return translationService.translate(key, params);
}

// Initialize the service when the module is loaded
if (typeof window !== "undefined") {
  translationService.init();
}
