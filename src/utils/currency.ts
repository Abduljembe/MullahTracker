import { CurrencyCode } from '../types/finance.ts';

export interface ExchangeRates {
  USD: number;
  KES: number;
  EUR: number;
  GBP: number;
  TZS: number;
  UGX: number;
  lastUpdated: string;
}

// Fallback rates if offline or API delay
export const DEFAULT_RATES: ExchangeRates = {
  USD: 1.0,
  KES: 129.79,
  EUR: 0.8909,
  GBP: 0.7503,
  TZS: 2560.0,
  UGX: 3680.0,
  lastUpdated: new Date().toISOString(),
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  KES: 'KSh',
  EUR: '€',
  GBP: '£',
  TZS: 'TSh',
  UGX: 'USh',
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: 'US Dollar ($)',
  KES: 'Kenya Shilling (KSh)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  TZS: 'Tanzanian Shilling (TSh)',
  UGX: 'Ugandan Shilling (USh)',
};

const CACHE_KEY = 'mullahtracker_fx_rates_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Retrieves the latest cached or default exchange rates.
 */
export function getStoredExchangeRates(): ExchangeRates {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.KES && parsed.EUR) {
        return parsed as ExchangeRates;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached exchange rates', e);
  }
  return DEFAULT_RATES;
}

/**
 * Fetches real-time exchange rates from open exchange API.
 */
export async function fetchLiveExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.rates) {
      const newRates: ExchangeRates = {
        USD: 1.0,
        KES: Number(data.rates.KES) || DEFAULT_RATES.KES,
        EUR: Number(data.rates.EUR) || DEFAULT_RATES.EUR,
        GBP: Number(data.rates.GBP) || DEFAULT_RATES.GBP,
        TZS: Number(data.rates.TZS) || DEFAULT_RATES.TZS,
        UGX: Number(data.rates.UGX) || DEFAULT_RATES.UGX,
        lastUpdated: new Date().toISOString(),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newRates));
      } catch (e) {
        /* ignore */
      }
      return newRates;
    }
  } catch (err) {
    console.warn('Could not fetch live exchange rates, falling back to cached/default rates:', err);
  }
  return getStoredExchangeRates();
}

/**
 * Calculate exchange rate from one currency to another using base USD rates.
 */
export function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates = getStoredExchangeRates()
): number {
  if (from === to) return 1;
  const fromRateInUSD = rates[from] || 1;
  const toRateInUSD = rates[to] || 1;
  // Since rates are: 1 USD = rates[C] units of C
  // 1 unit of 'from' = (toRateInUSD / fromRateInUSD) units of 'to'
  return toRateInUSD / fromRateInUSD;
}

/**
 * Convert an amount from one currency to another.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates = getStoredExchangeRates()
): number {
  if (from === to || !amount) return amount;
  const rate = getExchangeRate(from, to, rates);
  return amount * rate;
}

/**
 * Format currency with proper symbols and number spacing.
 */
export function formatCurrencyWithSymbol(
  amount: number,
  currency: CurrencyCode,
  options?: { showSymbol?: boolean; decimals?: number }
): string {
  const isCentsCurrency = currency === 'USD' || currency === 'EUR' || currency === 'GBP';
  const decimals = options?.decimals ?? (isCentsCurrency && Math.abs(amount) < 1000 && amount % 1 !== 0 ? 2 : 0);
  
  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (currency === 'USD') {
    return `$${formattedNumber}`;
  }
  if (currency === 'EUR') {
    return `€${formattedNumber}`;
  }
  if (currency === 'GBP') {
    return `£${formattedNumber}`;
  }
  // KES, TZS, UGX
  return `${currency} ${formattedNumber}`;
}
