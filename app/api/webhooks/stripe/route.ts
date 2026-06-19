import { NextResponse, type NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/webhooks/stripe
 * Handles Stripe subscription lifecycle events.
 * Raw body required — configured in next.config.ts / middleware to skip body parsing.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe webhook signature error: ${message}`)
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  try {
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Handler error'
    console.error(`Stripe webhook handler error for ${event.type}:`, err)
    // Return 200 to prevent Stripe retrying — log the error for manual investigation
    return NextResponse.json({ received: true, warning: message })
  }
}

async function getProfileByCustomer(customerId: string) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, supported_charity_id, charity_percentage')
    .eq('stripe_customer_id', customerId)
    .single()
  return data
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabaseUserId
      const plan = session.metadata?.plan as 'monthly' | 'yearly' | undefined

      if (userId && plan) {
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'active',
          subscription_plan: plan,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
        }).eq('id', userId)

        await supabaseAdmin.rpc('log_audit_event', {
          p_actor_id: userId,
          p_action: 'subscription.created',
          p_entity_type: 'profile',
          p_entity_id: userId,
          p_new_values: { plan, status: 'active' },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const profile = await getProfileByCustomer(sub.customer as string)
      if (!profile) break

      const statusMap: Record<string, string> = {
        active: 'active',
        trialing: 'trialing',
        past_due: 'past_due',
        canceled: 'cancelled',
        incomplete: 'inactive',
        incomplete_expired: 'inactive',
        unpaid: 'inactive',
        paused: 'inactive',
      }
      const status = statusMap[sub.status] ?? 'inactive'
      const plan = (sub.metadata?.plan ?? sub.items.data[0]?.price?.recurring?.interval === 'year'
        ? 'yearly'
        : 'monthly') as 'monthly' | 'yearly'

      await supabaseAdmin.from('profiles').update({
        subscription_status: status,
        subscription_plan: plan,
        stripe_subscription_id: sub.id,
        subscription_expires_at:
          sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        subscription_start_date:
          sub.start_date
            ? new Date(sub.start_date * 1000).toISOString()
            : undefined,
      }).eq('id', profile.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const profile = await getProfileByCustomer(sub.customer as string)
      if (!profile) break

      await supabaseAdmin.from('profiles').update({
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
        subscription_expires_at: null,
      }).eq('id', profile.id)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const profile = await getProfileByCustomer(invoice.customer as string)
      if (!profile) break

      // Renewal — ensure status stays active
      await supabaseAdmin.from('profiles').update({
        subscription_status: 'active',
      }).eq('id', profile.id)

      // Automatically apply charity contribution at payment time
      if (profile.supported_charity_id && invoice.amount_paid > 0) {
        const percentage = profile.charity_percentage ? Math.max(10, profile.charity_percentage) : 10
        // Stripe amounts are in cents
        const contributionAmount = (invoice.amount_paid / 100) * (percentage / 100)
        
        await supabaseAdmin.rpc('increment_charity_contribution', {
          p_charity_id: profile.supported_charity_id,
          p_amount: contributionAmount
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const profile = await getProfileByCustomer(invoice.customer as string)
      if (!profile) break

      await supabaseAdmin.from('profiles').update({
        subscription_status: 'past_due',
      }).eq('id', profile.id)
      break
    }

    default:
      // Unhandled event — no-op (safe to ignore)
      break
  }
}
