import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscription } from '@/app/actions/subscription'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    const ip = getRequestIp(request)
    const { allowed, resetAt } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, charityId, charityPercentage } = body

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Call the same action used by the web frontend
    const result = await createSubscription(
      plan, 
      charityId || null, 
      charityPercentage || 10
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
