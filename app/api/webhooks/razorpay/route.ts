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
            subscription_plan: sub.notes?.plan || 'monthly',
          }).eq('id', userId)
        } else {
          // Fallback if notes missing: lookup by subscription ID
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_expires_at: new Date(sub.current_end * 1000).toISOString(),
            subscription_plan: sub.notes?.plan || 'monthly',
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
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'past_due',
          }).eq('razorpay_subscription_id', payment.subscription_id)
        }
        break
      }

      case 'order.paid': {
        // Handle independent charity donations
        const order = payload.payload.order.entity
        const notes = order.notes || {}
        
        if (notes.type === 'independent_donation' && notes.charityId) {
          const amountInRupees = order.amount / 100
          
          // Update charity's total_contributed
          const { data: charity } = await supabaseAdmin
            .from('charities')
            .select('total_contributed')
            .eq('id', notes.charityId)
            .single()

          if (charity) {
            await supabaseAdmin
              .from('charities')
              .update({ total_contributed: (charity.total_contributed || 0) + amountInRupees })
              .eq('id', notes.charityId)
          }

          // Send notification if user is logged in
          if (notes.supabaseUserId && notes.supabaseUserId !== 'anonymous') {
            await supabaseAdmin.from('notifications').insert({
              user_id: notes.supabaseUserId,
              type: 'donation',
              title: 'Donation Confirmed',
              message: `Your ₹${amountInRupees.toLocaleString()} donation to ${notes.charityName} has been confirmed. Thank you, Hero!`,
            })
          }
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
