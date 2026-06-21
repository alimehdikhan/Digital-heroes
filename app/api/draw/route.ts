import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { formatApiError } from '@/lib/utils/errors'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limiter'

/**
 * GET /api/draw
 * Public: list completed draws (paginated, most recent first)
 */
export async function GET(request: Request) {
  try {
    const ip = getRequestIp(request)
    const { allowed, resetAt } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '10'), 50)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: draws, count, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        charities (id, name, logo_url),
        draw_winners (id, tier, amount, user_id)
      `, { count: 'exact' })
      .eq('status', 'completed')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .range(from, to)

    if (error) throw new Error(error.message)

    return NextResponse.json({
      data: draws,
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      error: null,
    })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
