/**
 * Stripe Price IDs and plan metadata.
 * Price IDs are set in environment variables — create them in the Stripe Dashboard.
 */

export const STRIPE_PRICES = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 9.99,
    currency: 'gbp',
    interval: 'month' as const,
    label: 'Monthly',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 79.99,
    currency: 'gbp',
    interval: 'year' as const,
    label: 'Yearly',
    savingsPercent: 33,
  },
} as const

export type StripePlan = keyof typeof STRIPE_PRICES
