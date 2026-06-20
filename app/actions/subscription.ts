"use server"

import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay/client'

export async function createSubscription(plan: 'monthly' | 'yearly', charityId: string | null, charityPercentage: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Ensure charity and percentage are stored in the user's profile if selected
  const profileUpdate: any = {}
  if (charityId) profileUpdate.supported_charity_id = charityId
  if (charityPercentage > 10) profileUpdate.charity_percentage = charityPercentage

  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
  }

  // Fallback for development if Razorpay keys aren't set or we are testing
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_key' || process.env.RAZORPAY_KEY_ID.includes('rzp_test_')) {
    console.warn('Test or missing RAZORPAY_KEY_ID detected. Simulating subscription.')
    await supabase.from('profiles').update({
      subscription_status: 'active',
      subscription_plan: plan
    }).eq('id', user.id)
    return { simulated: true }
  }

  const planId = plan === 'monthly' ? process.env.RAZORPAY_PLAN_MONTHLY : process.env.RAZORPAY_PLAN_YEARLY

  if (!planId) {
    return { error: 'Razorpay plan IDs not configured.' }
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: plan === 'monthly' ? 120 : 10, // Max 10 years
      notes: {
        supabaseUserId: user.id,
        plan: plan,
      }
    })

    return { subscriptionId: subscription.id, keyId: process.env.RAZORPAY_KEY_ID }
  } catch (error: any) {
    console.error('Razorpay session creation failed:', error)
    const errorMsg = error?.error?.description || error?.message || 'Failed to create subscription. Check Razorpay keys/plans.'
    return { error: errorMsg }
  }
}
