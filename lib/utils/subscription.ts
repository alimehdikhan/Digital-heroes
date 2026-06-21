export type SubscriptionProfile = {
  subscription_status: string
  subscription_expires_at?: string | null
}

/** Active subscription or grace period after expiry (PRD lifecycle). */
export function isSubscriptionActive(profile: SubscriptionProfile | null | undefined): boolean {
  if (!profile) return false
  const isActive = ['active', 'trialing'].includes(profile.subscription_status)
  const inGracePeriod =
    !!profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()
  return isActive || inGracePeriod
}
