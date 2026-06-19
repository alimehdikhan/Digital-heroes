import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret || !signature) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event

    // Log the webhook
    console.log(`[Razorpay Webhook] Received event: ${event}`)

    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.payload.subscription.entity
        const subscriptionId = sub.id
        const customerId = sub.customer_id
        const userId = sub.notes?.supabaseUserId

        if (userId) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_expires_at: new Date(sub.current_end * 1000).toISOString(),
            razorpay_customer_id: customerId,
            razorpay_subscription_id: subscriptionId,
          }).eq('id', userId)
        } else {
          // Fallback if notes missing: lookup by subscription ID
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_expires_at: new Date(sub.current_end * 1000).toISOString(),
          }).eq('razorpay_subscription_id', subscriptionId)
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted': {
        const sub = payload.payload.subscription.entity
        const subscriptionId = sub.id

        await supabaseAdmin.from('profiles').update({
          subscription_status: event === 'subscription.cancelled' || event === 'subscription.completed' ? 'cancelled' : 'past_due',
        }).eq('razorpay_subscription_id', subscriptionId)
        break
      }

      case 'payment.failed': {
        // Payment failed for a subscription
        const payment = payload.payload.payment.entity
        // If it's linked to a subscription
        if (payment.subscription_id) {
          // We can set status to past_due or leave it. Razorpay automatically retries.
          // But to be safe, we'll mark it as past_due if it's the latest payment that failed.
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'past_due',
          }).eq('razorpay_subscription_id', payment.subscription_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`Razorpay webhook error: ${err.message}`)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
