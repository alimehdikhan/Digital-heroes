import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { errors, formatApiError } from '@/lib/utils/errors'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limiter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const ip = getRequestIp(request)
    const { allowed, resetAt } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests.' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      )
    }

    const { drawId } = await params
    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        charities (id, name, logo_url, website_url, description),
        draw_winners (
          id, tier, match_count, matched_numbers, amount, paid_out,
          profiles (id, name, avatar_url),
          winner_proofs (id, status, proof_url)
        )
      `)
      .eq('id', drawId)
      .single()

    if (error || !draw) throw errors.notFound('Draw')
    return NextResponse.json({ data: draw, error: null })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
