import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { errors, formatApiError } from '@/lib/utils/errors'
import { countMatches, getTier, getMatchedNumbers } from '@/lib/draw/prizes'
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: draw, error: drawErr } = await supabaseAdmin
      .from('draws')
      .select('id, month, year, winning_numbers, status')
      .eq('id', drawId)
      .single()

    if (drawErr || !draw) throw errors.notFound('Draw')
    if (draw.status !== 'completed') {
      return NextResponse.json({ data: { status: 'draw_pending' }, error: null })
    }

    const { data: winnerRecord } = await supabaseAdmin
      .from('draw_winners')
      .select(`*, winner_proofs (id, status)`)
      .eq('draw_id', drawId)
      .eq('user_id', user.id)
      .single()

    if (winnerRecord) {
      return NextResponse.json({
        data: {
          tier: winnerRecord.tier,
          matchCount: winnerRecord.match_count,
          matchedNumbers: winnerRecord.matched_numbers,
          userScores: winnerRecord.user_scores,
          amount: winnerRecord.amount,
          proofStatus: winnerRecord.winner_proofs?.[0]?.status ?? null,
          proofId: winnerRecord.winner_proofs?.[0]?.id ?? null,
          drawWinnerId: winnerRecord.id,
        },
        error: null,
      })
    }

    const { data: userScores } = await supabaseAdmin
      .from('scores')
      .select('score, date')
      .eq('user_id', user.id)
      .gte('date', `${draw.year}-${String(draw.month).padStart(2, '0')}-01`)
      .lte('date', new Date(draw.year, draw.month, 0).toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(5)

    const scores = (userScores ?? []).map((s: { score: number }) => s.score)
    const winningNumbers = draw.winning_numbers as number[]
    const matchCount = countMatches(scores, winningNumbers)
    const matched = getMatchedNumbers(scores, winningNumbers)

    return NextResponse.json({
      data: {
        tier: null,
        matchCount,
        matchedNumbers: matched,
        userScores: scores,
        amount: 0,
        proofStatus: null,
        proofId: null,
        drawWinnerId: null,
      },
      error: null,
    })
  } catch (err) {
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
