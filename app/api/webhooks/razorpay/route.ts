import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, buildEmailTemplate } from '@/lib/email'

/**
 * ISSUE 3 FIX: Check if a webhook event has already been processed.
 * Uses the Razorpay event ID to prevent duplicate processing.
 * Stores processed event IDs in the audit_log table.
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('audit_logs')
    .select('id')
    .eq('entity_type', 'razorpay_webhook')
    .eq('entity_id', eventId)
    .maybeSingle()
  return !!data
}

async function markEventProcessed(eventId: string, eventName: string, payload: Record<string, unknown>) {
  await supabaseAdmin.from('audit_logs').insert({
    entity_type: 'razorpay_webhook',
    entity_id: eventId,
    action: `webhook.${eventName}`,
    new_values: payload,
  })
}

async function notifyUserBySubscriptionId(
  subscriptionId: string,
  subject: string,
  title: string,
  message: string
) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, name')
    .eq('razorpay_subscription_id', subscriptionId)
    .maybeSingle()

  if (!profile) return

  await supabaseAdmin.from('notifications').insert({
    user_id: profile.id,
    title,
    message,
    type: 'subscription',
  })

  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id)
  const email = authData.user?.email
  if (email) {
    await sendEmail({
      to: email,
      subject,
      body: message,
      html: buildEmailTemplate(title, `<p>${message}</p>`, `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`, 'Open Dashboard'),
    })
  }
}

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
    const eventId = payload.id || `${event}_${Date.now()}`

    // Log the webhook (use console.info for production observability)
    console.info(`[Razorpay Webhook] Received event: ${event}`)

    // ISSUE 3 FIX: Check idempotency — skip if already processed
    if (await isEventProcessed(eventId)) {
      console.info(`[Razorpay Webhook] Skipping duplicate event: ${eventId}`)
      return NextResponse.json({ received: true, duplicate: true })
    }

    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.payload.subscription.entity
        const subscriptionId = sub.id
        const customerId = sub.customer_id
        const userId = sub.notes?.supabaseUserId

        if (userId) {
          // ISSUE 3 FIX: Check if already active
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_status')
            .eq('id', userId)
            .single()

          if (existingProfile?.subscription_status === 'active') {
            console.info(`[Razorpay Webhook] User ${userId} already active, skipping`)
            await markEventProcessed(eventId, event, { userId, subscriptionId, skipped: 'already_active' })
            return NextResponse.json({ received: true, skipped: 'already_active' })
          }

          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_expires_at: new Date(sub.current_end * 1000).toISOString(),
            razorpay_customer_id: customerId,
            razorpay_subscription_id: subscriptionId,
            subscription_plan: sub.notes?.plan || 'monthly',
          }).eq('id', userId)

          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId)
          if (authData.user?.email) {
            const isRenewal = event === 'subscription.charged'
            await sendEmail({
              to: authData.user.email,
              subject: isRenewal ? 'Subscription Renewed' : 'Subscription Activated',
              body: isRenewal
                ? 'Your Digital Heroes subscription has renewed successfully.'
                : 'Welcome to Digital Heroes! Your subscription is now active.',
              html: buildEmailTemplate(
                isRenewal ? 'Subscription Renewed' : 'Welcome, Hero!',
                `<p>Your subscription is active. Log scores and enter the monthly draw from your dashboard.</p>`,
                `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
                'Go to Dashboard'
              ),
            })
            await supabaseAdmin.from('notifications').insert({
              user_id: userId,
              type: 'subscription',
              title: isRenewal ? 'Subscription Renewed' : 'Subscription Active',
              message: isRenewal
                ? 'Your plan renewed successfully.'
                : 'Your subscription is active. Start entering scores!',
            })
          }
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

        // ISSUE 3 FIX: Check if already cancelled
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('subscription_status')
          .eq('razorpay_subscription_id', subscriptionId)
          .single()

        if (existingProfile?.subscription_status === 'cancelled' || existingProfile?.subscription_status === 'past_due') {
          console.info(`[Razorpay Webhook] Subscription ${subscriptionId} already in final state, skipping`)
          await markEventProcessed(eventId, event, { subscriptionId, skipped: 'already_processed' })
          return NextResponse.json({ received: true, skipped: 'already_processed' })
        }

        await supabaseAdmin.from('profiles').update({
          subscription_status: event === 'subscription.cancelled' || event === 'subscription.completed' ? 'cancelled' : 'past_due',
        }).eq('razorpay_subscription_id', subscriptionId)

        if (event === 'subscription.cancelled' || event === 'subscription.completed') {
          await notifyUserBySubscriptionId(
            subscriptionId,
            'Subscription Cancelled',
            'Subscription Ended',
            'Your Digital Heroes subscription has ended. You can resubscribe any time.'
          )
        } else {
          await notifyUserBySubscriptionId(
            subscriptionId,
            'Subscription Payment Issue',
            'Payment Required',
            'Your subscription payment failed or was halted. Please update billing to restore access.'
          )
        }
        break
      }

      case 'payment.failed': {
        const payment = payload.payload.payment.entity
        if (payment.subscription_id) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'past_due',
          }).eq('razorpay_subscription_id', payment.subscription_id)

          await notifyUserBySubscriptionId(
            payment.subscription_id,
            'Payment Failed',
            'Payment Failed',
            'We could not process your subscription payment. Please update your payment method.'
          )
        }
        break
      }

      case 'order.paid': {
        const order = payload.payload.order.entity
        const notes = order.notes || {}
        
        if (notes.type === 'independent_donation' && notes.charityId) {
          const amountInRupees = order.amount / 100
          
          // ISSUE 3 FIX: Use receipt as idempotency key for donations
          const receiptKey = `donation_${order.receipt || order.id}`
          const alreadyProcessed = await isEventProcessed(receiptKey)
          if (!alreadyProcessed) {
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

            if (notes.supabaseUserId && notes.supabaseUserId !== 'anonymous') {
              await supabaseAdmin.from('notifications').insert({
                user_id: notes.supabaseUserId,
                type: 'donation',
                title: 'Donation Confirmed',
                message: `Your ₹${amountInRupees.toLocaleString()} donation to ${notes.charityName} has been confirmed. Thank you, Hero!`,
              })
            }

            await markEventProcessed(receiptKey, 'order.paid', { orderId: order.id, charityId: notes.charityId, amount: amountInRupees })
          }
        }
        break
      }
    }

    // Mark event as processed
    await markEventProcessed(eventId, event, { summary: 'processed' })

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`Razorpay webhook error: ${err.message}`)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
