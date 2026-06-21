"use server"

import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay/client'
import { revalidatePath } from 'next/cache'
import { sendEmail, buildEmailTemplate } from '@/lib/email'

export async function createSubscription(plan: 'monthly' | 'yearly', charityId: string | null, charityPercentage: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('supported_charity_id')
    .eq('id', user.id)
    .single()

  const resolvedCharityId = charityId || existingProfile?.supported_charity_id
  if (!resolvedCharityId) {
    return { error: 'Please select a charity before subscribing (minimum 10% contribution).' }
  }

  const effectivePct = Math.max(charityPercentage, 10)
  await supabase.from('profiles').update({
    supported_charity_id: resolvedCharityId,
    charity_percentage: effectivePct,
  }).eq('id', user.id)

  // Fallback for development if Razorpay keys aren't set or we are using a dummy key
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_key') {
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

export async function cancelSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('razorpay_subscription_id, subscription_status, name')
    .eq('id', user.id)
    .single()

  if (!profile || !['active', 'trialing', 'past_due'].includes(profile.subscription_status)) {
    return { error: 'No active subscription to cancel' }
  }

  if (
    profile.razorpay_subscription_id &&
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_ID !== 'dummy_key'
  ) {
    try {
      await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, false)
    } catch (error: any) {
      console.error('Razorpay cancel failed:', error)
      return { error: error?.message || 'Failed to cancel subscription with payment provider' }
    }
  }

  await supabase.from('profiles').update({ subscription_status: 'cancelled' }).eq('id', user.id)

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: 'Subscription Cancelled',
      body: `Hi ${profile.name}, your Digital Heroes subscription has been cancelled.`,
      html: buildEmailTemplate(
        'Subscription Cancelled',
        `<p>Hello <strong>${profile.name}</strong>,</p>
         <p>Your subscription has been cancelled. You can resubscribe any time from your profile.</p>`,
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
        'Resubscribe'
      ),
    })
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}
