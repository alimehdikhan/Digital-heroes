'use server'

import { razorpay } from '@/lib/razorpay/client'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function createDonationOrder(charityId: string, amountInPaise: number) {
  // Validate amount (min ₹100 = 10000 paise, max ₹100,000 = 10000000 paise)
  if (amountInPaise < 10000 || amountInPaise > 10000000) {
    return { error: 'Donation must be between ₹100 and ₹1,00,000' }
  }

  // Verify charity exists
  const { data: charity } = await supabaseAdmin
    .from('charities')
    .select('id, name')
    .eq('id', charityId)
    .eq('is_deleted', false)
    .single()

  if (!charity) {
    return { error: 'Charity not found' }
  }

  // Get user if logged in (optional for donations)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `donation_${charityId}_${Date.now()}`,
      notes: {
        type: 'independent_donation',
        charityId: charityId,
        charityName: charity.name,
        supabaseUserId: user?.id || 'anonymous',
      }
    })

    return { 
      orderId: order.id, 
      keyId: process.env.RAZORPAY_KEY_ID,
      charityName: charity.name,
      amount: amountInPaise
    }
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error)
    return { error: error?.error?.description || 'Failed to create donation order' }
  }
}

