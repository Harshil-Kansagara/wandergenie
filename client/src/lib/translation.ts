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
  private fallbackTranslations: TranslationStrings = {};

  isLanguageSupported(languageCode: string): boolean {
    return SUPPORTED_LANGUAGES.some((lang) => lang.code === languageCode);
  }

  async setLanguage(languageCode: string): Promise<TranslationStrings> {
    if (!this.isLanguageSupported(languageCode)) {
      console.warn(
        `Language ${languageCode} is not supported. Falling back to English.`
      );
      languageCode = "en";
    }

    this.currentLanguage = languageCode;

    try {
      // Ensure English (fallback) is always loaded
      if (!translationCache.has("en")) {
        const fallback = await this.loadTranslations("en");
        this.fallbackTranslations = fallback;
        translationCache.set("en", fallback);
      }
      const translations = await this.loadTranslations(languageCode);
      this.translations = { ...this.fallbackTranslations, ...translations };
      translationCache.set(languageCode, this.translations);
    } catch (error) {
      console.error(`Failed to load translations for ${languageCode}:`, error);
      this.translations = this.fallbackTranslations;
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
   * @returns A promise that resolves to the translation strings.
   */
  async loadTranslations(languageCode: string): Promise<TranslationStrings> {
    if (translationCache.has(languageCode)) {
      return translationCache.get(languageCode)!;
    }
    try {
      const localeModules = import.meta.glob(
        "/src/assets/i18n/*.json"
      ) as Record<string, () => Promise<any>>;
      const path = `/src/assets/i18n/${languageCode}.json`;
      const importFn = localeModules[path];
      const mod = await importFn();
      return mod.default || mod;
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
