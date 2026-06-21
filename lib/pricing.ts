export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP'

export interface CurrencyConfig {
  code: SupportedCurrency
  symbol: string
  locale: string
  monthlyPrice: number    // In smallest unit (paise/cents)
  yearlyPrice: number
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    monthlyPrice: 1999,     // ₹1,999
    yearlyPrice: 19999,     // ₹19,999
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    monthlyPrice: 2499,     // $24.99
    yearlyPrice: 24999,     // $249.99
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'en-DE',
    monthlyPrice: 2299,     // €22.99
    yearlyPrice: 22999,     // €229.99
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    monthlyPrice: 1999,     // £19.99
    yearlyPrice: 19999,     // £199.99
  },
}

export const DEFAULT_CURRENCY: SupportedCurrency = 'INR'

export function getCurrencyConfig(currency?: string | null): CurrencyConfig {
  if (currency && currency in CURRENCIES) {
    return CURRENCIES[currency as SupportedCurrency]
  }
  return CURRENCIES[DEFAULT_CURRENCY]
}

export function formatPrice(amount: number, currency: string = 'INR'): string {
  const config = getCurrencyConfig(currency)
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

export function formatPriceFull(amount: number, currency: string = 'INR'): string {
  const config = getCurrencyConfig(currency)
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

export function getPlanPrice(plan: string | null | undefined, currency?: string | null): number {
  const config = getCurrencyConfig(currency)
  if (plan === 'yearly') return config.yearlyPrice
  return config.monthlyPrice
}

// Legacy export for backward compatibility
export const PRICING_PLANS = {
  monthly: { price: 1999 },
  yearly: { price: 19999 },
}
