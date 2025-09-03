import { currencyApi } from "./api";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate?: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "EGP", symbol: "£", name: "Egyptian Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
];

export class CurrencyConverter {
  private rates: { [key: string]: number } = {};
  private baseCurrency: string = 'USD';
  private lastUpdated: Date | null = null;
  private updateInterval: number = 60 * 60 * 1000; // 1 hour

  async updateRates(baseCurrency: string = 'USD') {
    try {
      const data = await currencyApi.getExchangeRates(baseCurrency);
      this.rates = data.rates;
      this.baseCurrency = baseCurrency;
      this.lastUpdated = new Date();
      
      // Cache rates in localStorage
      localStorage.setItem('currency_rates', JSON.stringify({
        rates: this.rates,
        baseCurrency: this.baseCurrency,
        lastUpdated: this.lastUpdated.toISOString(),
      }));
    } catch (error) {
      console.error('Failed to update currency rates:', error);
      // Try to load from cache
      this.loadFromCache();
    }
  }

  private loadFromCache() {
    try {
      const cached = localStorage.getItem('currency_rates');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(data.lastUpdated).getTime();
        
        // Use cached data if it's less than 24 hours old
        if (cacheAge < 24 * 60 * 60 * 1000) {
          this.rates = data.rates;
          this.baseCurrency = data.baseCurrency;
          this.lastUpdated = new Date(data.lastUpdated);
        }
      }
    } catch (error) {
      console.error('Failed to load currency rates from cache:', error);
    }
  }

  async ensureRatesLoaded() {
    if (!this.lastUpdated || Date.now() - this.lastUpdated.getTime() > this.updateInterval) {
      await this.updateRates();
    }
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
      console.warn(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
      return amount; // Return original amount if rates not available
    }

    // Convert via base currency (USD)
    let usdAmount = amount;
    if (fromCurrency !== this.baseCurrency) {
      usdAmount = amount / this.rates[fromCurrency];
    }

    if (toCurrency === this.baseCurrency) {
      return usdAmount;
    }

    return usdAmount * this.rates[toCurrency];
  }

  formatCurrency(amount: number, currencyCode: string): string {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }

    // Use Intl.NumberFormat for proper currency formatting
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2,
      }).format(amount);
    } catch (error) {
      // Fallback to manual formatting
      const roundedAmount = currencyCode === 'JPY' || currencyCode === 'KRW' 
        ? Math.round(amount) 
        : Math.round(amount * 100) / 100;
      
      return `${currency.symbol}${roundedAmount.toLocaleString()}`;
    }
  }

  getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
    return CURRENCIES.find(c => c.code === currencyCode);
  }

  getAllCurrencies(): CurrencyInfo[] {
    return CURRENCIES;
  }

  getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
      return 1;
    }

    return this.rates[toCurrency] / this.rates[fromCurrency];
  }

  isRateAvailable(currencyCode: string): boolean {
    return !!this.rates[currencyCode];
  }

  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }
}

// Create a singleton instance
export const currencyConverter = new CurrencyConverter();

// Initialize rates on module load
currencyConverter.ensureRatesLoaded().catch(console.error);

// Utility functions
export function formatPrice(amount: number, currency: string): string {
  return currencyConverter.formatCurrency(amount, currency);
}

export function convertPrice(amount: number, fromCurrency: string, toCurrency: string): number {
  return currencyConverter.convert(amount, fromCurrency, toCurrency);
}

export function detectCurrencyFromLocation(countryCode: string): string {
  const currencyMap: { [key: string]: string } = {
    'US': 'USD', 'CA': 'CAD', 'MX': 'MXN', 'BR': 'BRL',
    'GB': 'GBP', 'IE': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
    'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'GR': 'EUR', 'FI': 'EUR',
    'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK', 'CH': 'CHF',
    'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RU': 'RUB', 'TR': 'TRY',
    'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR',
    'TH': 'THB', 'MY': 'MYR', 'ID': 'IDR', 'PH': 'PHP', 'VN': 'VND',
    'SG': 'SGD', 'AU': 'AUD', 'NZ': 'NZD',
    'ZA': 'ZAR', 'EG': 'EGP', 'AE': 'AED', 'SA': 'SAR', 'IL': 'ILS',
  };

  return currencyMap[countryCode] || 'USD';
}
