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
      case 'subscription.charged':
      case 'subscription.authenticated': {
        const sub = payload.payload.subscription.entity
        const subscriptionId = sub.id
        const customerId = sub.customer_id
        
        // Find user by razorpay metadata or customer ID
        // Note: Razorpay subscriptions have notes where we can store userId
        const userId = sub.notes?.supabaseUserId

        if (userId) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_expires_at: new Date(sub.current_end * 1000).toISOString(),
            razorpay_customer_id: customerId,
            razorpay_subscription_id: subscriptionId,
          }).eq('id', userId)
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.halted': {
        const sub = payload.payload.subscription.entity
        const subscriptionId = sub.id

        await supabaseAdmin.from('profiles').update({
          subscription_status: event === 'subscription.cancelled' ? 'cancelled' : 'past_due',
        }).eq('razorpay_subscription_id', subscriptionId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`Razorpay webhook error: ${err.message}`)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
