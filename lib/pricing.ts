export const PRICING_PLANS = {
  monthly: {
    price: 20.00,
  },
  yearly: {
    price: 16.66, // monthly equivalent
  }
}

export function getPlanPrice(plan: string | null | undefined): number {
  if (plan === 'yearly') return PRICING_PLANS.yearly.price;
  return PRICING_PLANS.monthly.price; // default
}
