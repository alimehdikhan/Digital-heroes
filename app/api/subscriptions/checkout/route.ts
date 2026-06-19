import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_PRICES } from '@/lib/stripe/prices'
import { createCheckoutSchema } from '@/validators/subscription'
import { errors, formatApiError } from '@/lib/utils/errors'
import { ZodError } from 'zod'

/**
 * POST /api/subscriptions/checkout
 * Creates a Stripe Checkout session for monthly or yearly subscription.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const body = await request.json()
    const { plan } = createCheckoutSchema.parse(body)

    const priceConfig = STRIPE_PRICES[plan]
    if (!priceConfig.priceId) {
      throw errors.internal(`Stripe price ID for ${plan} plan is not configured`)
    }

    // Get or create Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, name, subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status === 'active') {
      throw errors.conflict('You already have an active subscription')
    }

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.name,
        metadata: { supabaseUserId: user.id },
      })
      customerId = customer.id
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { supabaseUserId: user.id, plan },
      subscription_data: {
        metadata: { supabaseUserId: user.id, plan },
      },
    })

    return NextResponse.json({ data: { url: session.url }, error: null })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid subscription data', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
