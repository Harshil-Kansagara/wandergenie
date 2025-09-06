/**
 * A simple wrapper around a currency exchange rate API.
 */
export class CurrencyApi {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getExchangeRates(baseCurrency: string = "USD") {
    try {
      const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
      const response = await fetch(url);
      const data = await response.json();

      return {
        base: data.base,
        rates: data.rates,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Currency API error:", error);
      // Return mock rates if API fails
      return {
        base: baseCurrency,
        rates: {
          USD: 1.0,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.0,
          INR: 74.5,
          AUD: 1.35,
          CAD: 1.25,
          CHF: 0.92,
          CNY: 6.45,
          SGD: 1.35,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
