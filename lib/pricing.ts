export const PRICING_PLANS = {
  monthly: {
    price: 1999,
  },
  yearly: {
    price: 19999,
  }
}

export function getPlanPrice(plan: string | null | undefined): number {
  if (plan === 'yearly') return PRICING_PLANS.yearly.price;
  return PRICING_PLANS.monthly.price; // default
}
