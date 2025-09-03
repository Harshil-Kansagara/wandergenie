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
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
];

// Base English translations
export const EN_TRANSLATIONS: TranslationStrings = {
  // Navigation
  'destinations': 'Destinations',
  'experiences': 'Experiences',
  'hotels': 'Hotels',
  'flights': 'Flights',
  'sign_in': 'Sign In',
  'sign_up': 'Sign Up',
  'back': 'Back',
  
  // Hero Section
  'discover_world_with_ai': 'Discover the World with AI',
  'ai_craft_perfect_adventure': 'Let artificial intelligence craft your perfect global adventure. From heritage tours to thrilling experiences - personalized just for you.',
  'plan_perfect_trip': 'Plan Your Perfect Trip',
  'from': 'From',
  'destination_worldwide': 'Destination Worldwide',
  'current_location': 'Your current location',
  'where_want_to_go': 'Where do you want to go?',
  'generate_ai_itinerary': 'Generate AI Itinerary',
  
  // Trip Planning Form
  'create_your_perfect_trip': 'Create Your Perfect Trip',
  'ai_powered_planning_description': 'Tell us about your travel preferences and let our AI create a personalized itinerary just for you.',
  'check_in': 'Check-in',
  'check_out': 'Check-out',
  'budget_range': 'Budget Range',
  'travel_theme': 'Travel Theme',
  'select_theme': 'Select a theme',
  'heritage_culture': 'Heritage & Culture',
  'adventure_trekking': 'Adventure & Trekking',
  'nightlife_entertainment': 'Nightlife & Entertainment',
  'spiritual_wellness': 'Spiritual & Wellness',
  'food_culinary': 'Food & Culinary',
  'beach_relaxation': 'Beach & Relaxation',
  'culture_museums': 'Culture & Museums',
  'nature_wildlife': 'Nature & Wildlife',
  'advanced_options': 'Advanced Options',
  'group_size': 'Group Size',
  'accommodation': 'Accommodation',
  'any': 'Any',
  'budget': 'Budget',
  'mid_range': 'Mid-range',
  'luxury': 'Luxury',
  'transport': 'Transport',
  'mixed': 'Mixed',
  'flight_preferred': 'Flight Preferred',
  'train_preferred': 'Train Preferred',
  'road_trip': 'Road Trip',
  'cancel': 'Cancel',
  'generating': 'Generating...',
  
  // Itinerary
  'personalized_itinerary_description': 'AI-crafted journey perfectly tailored for your adventure',
  'day': 'Day',
  'travelers': 'travelers',
  'days': 'days',
  'no_itinerary_generated': 'No itinerary has been generated yet.',
  'view_complete_itinerary': 'View Complete Itinerary',
  'trip_summary': 'Trip Summary',
  'activities_tours': 'Activities & Tours',
  'transportation': 'Transportation',
  'meals': 'Meals',
  'miscellaneous': 'Miscellaneous',
  'total_2_people': 'Total (2 people)',
  'within_budget_range': 'Within your budget range',
  'book_complete_trip': 'Book Complete Trip',
  'save': 'Save',
  'share': 'Share',
  'budget_friendly': 'Budget Friendly',
  'ai_insights': 'AI Insights',
  'quick_actions': 'Quick Actions',
  'modify_itinerary': 'Modify Itinerary',
  'add_experience': 'Add Experience',
  'view_on_map': 'View on Map',
  'trip_not_found': 'Trip not found',
  'back_to_home': 'Back to Home',
  'ai_weather_alert': 'AI Alert: Weather changes detected, activities adjusted accordingly.',
  
  // Weather
  'weather_forecast': 'Weather Forecast',
  'sunny': 'Sunny',
  'cloudy': 'Cloudy',
  'partly_cloudy': 'Partly Cloudy',
  'rainy': 'Rainy',
  'snowy': 'Snowy',
  '7_day_forecast': '7-Day Forecast',
  'rain_expected_pack_umbrella': 'Rain expected. Pack light rain gear for outdoor activities.',
  
  // Map
  'route_map': 'Route Map',
  'satellite': 'Satellite',
  'map': 'Map',
  'total_distance': 'Total Distance',
  
  // Dashboard
  'new_trip': 'New Trip',
  'your_trips': 'Your Trips',
  'manage_your_travel_plans': 'Manage and view all your travel plans in one place',
  'no_trips_yet': 'No trips yet',
  'start_planning_first_trip': 'Start planning your first adventure with our AI-powered trip planner',
  'create_your_first_trip': 'Create Your First Trip',
  'draft': 'Draft',
  'confirmed': 'Confirmed',
  'completed': 'Completed',
  
  // Booking
  'complete_booking': 'Complete Your Booking',
  'selection': 'Selection',
  'payment': 'Payment',
  'confirmation': 'Confirmation',
  'booking_summary': 'Booking Summary',
  'base_itinerary': 'Base Itinerary',
  'travel_insurance': 'Travel Insurance',
  'total_amount': 'Total Amount',
  'proceed_to_payment': 'Proceed to Payment',
  'confirm_booking': 'Confirm Booking',
  'back_to_selection': 'Back to Selection',
  'processing': 'Processing...',
  'payment_details': 'Payment Details',
  'cardholder_name': 'Cardholder Name',
  'enter_full_name': 'Enter full name',
  'card_number': 'Card Number',
  'month': 'Month',
  'year': 'Year',
  'cvv': 'CVV',
  'other_payment_options': 'Other Payment Options',
  'travel_protection': 'Travel Protection',
  'comprehensive_travel_insurance': 'Comprehensive Travel Insurance',
  'trip_cancellation_medical_baggage': 'Trip cancellation, medical, & baggage protection',
  'booking_confirmed': 'Booking Confirmed!',
  'booking_confirmation_sent': 'Confirmation details have been sent to your email.',
  'booking_confirmation_details': 'Your trip has been successfully booked. You will receive confirmation details shortly.',
  'booking_reference': 'Booking Reference',
  'view_booking_details': 'View Booking Details',
  'booking_failed': 'Booking Failed',
  'please_try_again': 'Please try again later.',
  
  // Activity Types
  'meal': 'Meal',
  'total': 'Total',
  
  // Popular Destinations
  'trending_destinations': 'Trending Destinations',
  'discover_popular_experiences': 'Discover the world\'s most popular travel experiences powered by AI recommendations',
  
  // Trust Indicators
  'trips_planned': 'Trips Planned',
  'happy_travelers': 'Happy Travelers',
  'average_rating': 'Average Rating',
  
  // Footer
  'services': 'Services',
  'support': 'Support',
  
  // Messages
  'itinerary_generated': 'Itinerary Generated',
  'itinerary_generated_success': 'Your personalized itinerary has been created successfully!',
  'error': 'Error',
  'failed_to_generate_itinerary': 'Failed to generate itinerary. Please try again.',
};

// Translation cache
const translationCache = new Map<string, TranslationStrings>();

export class TranslationService {
  private currentLanguage: string = 'en';
  private translations: TranslationStrings = EN_TRANSLATIONS;
  private fallbackTranslations: TranslationStrings = EN_TRANSLATIONS;

  constructor() {
    // Initialize with browser language if supported
    const browserLang = navigator.language.split('-')[0];
    if (this.isLanguageSupported(browserLang)) {
      this.setLanguage(browserLang);
    }
  }

  isLanguageSupported(languageCode: string): boolean {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
  }

  async setLanguage(languageCode: string): Promise<void> {
    if (!this.isLanguageSupported(languageCode)) {
      console.warn(`Language ${languageCode} is not supported. Falling back to English.`);
      return;
    }

    this.currentLanguage = languageCode;

    if (languageCode === 'en') {
      this.translations = EN_TRANSLATIONS;
      return;
    }

    // Check cache first
    if (translationCache.has(languageCode)) {
      this.translations = translationCache.get(languageCode)!;
      return;
    }

    try {
      // Try to load translations from API or generate them
      const translations = await this.loadTranslations(languageCode);
      this.translations = { ...EN_TRANSLATIONS, ...(translations as TranslationStrings) };
      translationCache.set(languageCode, this.translations);
      
      // Cache in localStorage for offline use
      localStorage.setItem(`translations_${languageCode}`, JSON.stringify(this.translations));
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
        console.error('Failed to load cached translations:', cacheError);
        // Fall back to English
        this.translations = EN_TRANSLATIONS;
      }
    }
  }

  private async loadTranslations(languageCode: string): Promise<TranslationStrings> {
    // In a real application, you would call a translation API here
    // For now, we'll provide some basic translations for major languages
    
    const basicTranslations: { [key: string]: Partial<TranslationStrings> } = {
      'es': {
        'destinations': 'Destinos',
        'experiences': 'Experiencias',
        'hotels': 'Hoteles',
        'flights': 'Vuelos',
        'sign_in': 'Iniciar Sesión',
        'discover_world_with_ai': 'Descubre el Mundo con IA',
        'plan_perfect_trip': 'Planifica tu Viaje Perfecto',
        'from': 'Desde',
        'destination_worldwide': 'Destino Mundial',
        'generate_ai_itinerary': 'Generar Itinerario con IA',
        'save': 'Guardar',
        'share': 'Compartir',
      },
      'fr': {
        'destinations': 'Destinations',
        'experiences': 'Expériences',
        'hotels': 'Hôtels',
        'flights': 'Vols',
        'sign_in': 'Se Connecter',
        'discover_world_with_ai': 'Découvrez le Monde avec l\'IA',
        'plan_perfect_trip': 'Planifiez votre Voyage Parfait',
        'from': 'De',
        'destination_worldwide': 'Destination Mondiale',
        'generate_ai_itinerary': 'Générer un Itinéraire IA',
        'save': 'Sauvegarder',
        'share': 'Partager',
      },
      'de': {
        'destinations': 'Reiseziele',
        'experiences': 'Erfahrungen',
        'hotels': 'Hotels',
        'flights': 'Flüge',
        'sign_in': 'Anmelden',
        'discover_world_with_ai': 'Entdecke die Welt mit KI',
        'plan_perfect_trip': 'Plane deine perfekte Reise',
        'from': 'Von',
        'destination_worldwide': 'Weltweites Reiseziel',
        'generate_ai_itinerary': 'KI-Reiseplan erstellen',
        'save': 'Speichern',
        'share': 'Teilen',
      },
      'ja': {
        'destinations': '目的地',
        'experiences': '体験',
        'hotels': 'ホテル',
        'flights': 'フライト',
        'sign_in': 'サインイン',
        'discover_world_with_ai': 'AIで世界を発見',
        'plan_perfect_trip': '完璧な旅行を計画',
        'from': 'から',
        'destination_worldwide': '世界の目的地',
        'generate_ai_itinerary': 'AI旅程を生成',
        'save': '保存',
        'share': '共有',
      },
      'zh': {
        'destinations': '目的地',
        'experiences': '体验',
        'hotels': '酒店',
        'flights': '航班',
        'sign_in': '登录',
        'discover_world_with_ai': '用AI发现世界',
        'plan_perfect_trip': '规划完美旅行',
        'from': '从',
        'destination_worldwide': '全球目的地',
        'generate_ai_itinerary': '生成AI行程',
        'save': '保存',
        'share': '分享',
      },
    };

    return (basicTranslations[languageCode] || {}) as TranslationStrings;
  }

  translate(key: string, params?: { [key: string]: string }): string {
    let translation = this.translations[key] || this.fallbackTranslations[key] || key;

    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
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
    return SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  }

  // Utility method to get language direction (for RTL languages)
  getLanguageDirection(languageCode?: string): 'ltr' | 'rtl' {
    const lang = languageCode || this.currentLanguage;
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
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
    if (!langInfo) return 'en-US';

    // Map language codes to locales
    const localeMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'hi': 'hi-IN',
      'ar': 'ar-SA',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'no': 'nb-NO',
      'da': 'da-DK',
      'pl': 'pl-PL',
      'tr': 'tr-TR',
    };

    return localeMap[this.currentLanguage] || 'en-US';
  }
}

// Create singleton instance
export const translationService = new TranslationService();

// Utility function for quick translations
export function t(key: string, params?: { [key: string]: string }): string {
  return translationService.translate(key, params);
}

// Auto-detect user language on module load
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('preferred_language');
  if (savedLanguage && translationService.isLanguageSupported(savedLanguage)) {
    translationService.setLanguage(savedLanguage);
  }
}
