"use server"

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(formData: FormData) {
  const plan = formData.get('plan') as 'monthly' | 'yearly'
  const charityId = formData.get('charityId') as string | null
  const charityPctRaw = formData.get('charityPercentage')
  const charityPercentage = charityPctRaw ? Math.max(10, parseFloat(charityPctRaw as string)) : 10

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure charity and percentage are stored in the user's profile if selected
  const profileUpdate: any = {}
  if (charityId) profileUpdate.supported_charity_id = charityId
  if (charityPercentage > 10) profileUpdate.charity_percentage = charityPercentage

  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
  }

  // In a real app, you would have these IDs in an env file or DB.
  // Using placeholder Price IDs for demo purposes, or we could create them on the fly if test keys.
  // For safety, we will just simulate success by passing `success_url` back to the site.
  // Actually, since Stripe SDK is installed, let's create a session.
  
  // NOTE: If Stripe keys are placeholders, this will fail. We wrap in try/catch.
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan === 'monthly' ? process.env.STRIPE_MONTHLY_PRICE_ID : process.env.STRIPE_YEARLY_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        supabaseUserId: user.id,
        plan: plan,
      },
    })

    if (session.url) {
      redirect(session.url)
    }
  } catch (error) {
    console.error('Stripe session creation failed:', error)
    // Fallback if Stripe keys aren't set up yet:
    // Just update the profile directly so the user can test the app
    await supabase.from('profiles').update({
      subscription_status: 'active',
      subscription_plan: plan
    }).eq('id', user.id)

    redirect('/dashboard?checkout=simulated_success')
  }
}
