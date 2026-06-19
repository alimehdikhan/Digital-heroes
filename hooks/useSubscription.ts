'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { SubscriptionPlan } from '@/types/app'

export function useSubscription() {
  const { profile, isSubscribed } = useAuthStore()

  const startCheckout = useCallback(async (plan: SubscriptionPlan) => {
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    // Redirect to Stripe Checkout
    window.location.href = json.data.url
  }, [])

  const openBillingPortal = useCallback(async () => {
    const res = await fetch('/api/subscriptions/portal', { method: 'POST' })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    window.location.href = json.data.url
  }, [])

  return {
    status: profile?.subscriptionStatus ?? 'inactive',
    plan: profile?.subscriptionPlan ?? null,
    isSubscribed,
    expiresAt: profile?.subscriptionExpiresAt ?? null,
    startCheckout,
    openBillingPortal,
  }
}
