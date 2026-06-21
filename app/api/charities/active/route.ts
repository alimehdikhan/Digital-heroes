import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { errors, formatApiError } from '@/lib/utils/errors'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limiter'

/**
 * GET /api/charities/active
 * Public: returns the currently active charity
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getRequestIp(request)
    const { allowed, resetAt } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests.' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single()

    if (error || !data) throw errors.notFound('Active charity')
    return NextResponse.json({ data, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
