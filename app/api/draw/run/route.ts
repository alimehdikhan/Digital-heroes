import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { runDrawSchema } from '@/validators/draw'
import { runDraw } from '@/lib/draw/engine'
import { errors, formatApiError } from '@/lib/utils/errors'
import { getMonthDateRange, getPrevDrawPeriod } from '@/lib/utils/dates'
import { ZodError } from 'zod'

/**
 * POST /api/draw/run
 * Admin-only: execute the monthly draw.
 * Body: RunDrawRequest
 */
export async function POST(request: NextRequest) {
  try {
    // Auth + admin check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw errors.unauthorized()

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      throw errors.forbidden('Admin access required to run a draw')
    }

    // Validate body
    const body = await request.json()
    const input = runDrawSchema.parse(body)

    // Guard: draw not already completed for this month
    const { data: existing } = await supabaseAdmin
      .from('draws')
      .select('id, status')
      .eq('month', input.month)
      .eq('year', input.year)
      .single()

    if (existing?.status === 'completed') {
      throw errors.conflict(`Draw for ${input.month}/${input.year} is already completed`)
    }

    // Mark draw as in_progress
    if (existing) {
      await supabaseAdmin
        .from('draws')
        .update({ status: 'in_progress' })
        .eq('id', existing.id)
    }

    // Get all participants via DB function
    const { data: participants, error: participantsError } = await supabaseAdmin
      .rpc('get_draw_participants', { p_month: input.month, p_year: input.year })

    if (participantsError) throw new Error(participantsError.message)
    if (!participants || participants.length === 0) {
      throw errors.validation('No active subscribers with scores for this month')
    }

    // Get previous jackpot rollover
    const prev = getPrevDrawPeriod(input.month, input.year)
    const { data: prevDraw } = await supabaseAdmin
      .from('draws')
      .select('jackpot_amount, jackpot_rolled_over')
      .eq('month', prev.month)
      .eq('year', prev.year)
      .eq('jackpot_rolled_over', true)
      .single()

    const rolloverAmount = prevDraw ? Number(prevDraw.jackpot_amount) : 0

    // Auto-calculate pool amount
    const monthlyCount = participants.filter((p: any) => p.subscription_plan === 'monthly').length || 0
    const yearlyCount = participants.filter((p: any) => p.subscription_plan === 'yearly').length || 0
    const calculatedPool = (monthlyCount * 20) + (yearlyCount * 16.66)
    const poolAmount = calculatedPool > 0 ? calculatedPool : 50000

    // Run the draw engine
    const result = await runDraw(
      input.mode,
      participants.map((p: { user_id: string; scores: number[] }) => ({
        userId: p.user_id,
        scores: p.scores,
      })),
      poolAmount,
      rolloverAmount,
      input.charityPercentage ?? 10
    )

    // Persist draw record
    const drawPayload = {
      month: input.month,
      year: input.year,
      mode: input.mode,
      winning_numbers: result.winningNumbers,
      total_pool: result.totalPool,
      jackpot_amount: result.jackpotAmount,
      prize_4match: result.prize4match,
      prize_3match: result.prize3match,
      jackpot_rolled_over: result.jackpotRolledOver,
      rollover_amount: rolloverAmount,
      charity_id: input.charityId ?? null,
      charity_contribution: result.charityContribution,
      charity_percentage: result.charityPercentage,
      participant_count: result.participantCount,
      status: 'pending',
      run_by: user.id,
      run_at: new Date().toISOString(),
    }

    let drawId: string
    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from('draws')
        .update(drawPayload)
        .eq('id', existing.id)
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      drawId = updated.id
    } else {
      const { data: created, error } = await supabaseAdmin
        .from('draws')
        .insert(drawPayload)
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      drawId = created.id
    }

    // Persist winners
    if (result.winners.length > 0) {
      const winnerRows = result.winners.map((w) => ({
        draw_id: drawId,
        user_id: w.userId,
        tier: w.tier,
        match_count: w.matchCount,
        matched_numbers: w.matchedNumbers,
        user_scores: w.userScores,
        amount: w.amount,
      }))
      const { error: winnerErr } = await supabaseAdmin
        .from('draw_winners')
        .insert(winnerRows)
      if (winnerErr) throw new Error(winnerErr.message)
    }

    // Update charity total_contributed
    if (input.charityId && result.charityContribution > 0) {
      await supabaseAdmin.rpc('increment_charity_contribution', {
        p_charity_id: input.charityId,
        p_amount: result.charityContribution,
      })
    }

    // Audit log
    await supabaseAdmin.rpc('log_audit_event', {
      p_actor_id: user.id,
      p_action: 'draw.run',
      p_entity_type: 'draw',
      p_entity_id: drawId,
      p_new_values: {
        winningNumbers: result.winningNumbers,
        jackpotRolledOver: result.jackpotRolledOver,
        participantCount: result.participantCount,
        winnersCount: result.winners.length,
      },
    })

    return NextResponse.json({
      data: {
        drawId,
        winningNumbers: result.winningNumbers,
        jackpotRolledOver: result.jackpotRolledOver,
        jackpotAmount: result.jackpotAmount,
        participantCount: result.participantCount,
        winners: result.winners.map((w) => ({
          userId: w.userId,
          tier: w.tier,
          amount: w.amount,
          matchCount: w.matchCount,
        })),
        charityContribution: result.charityContribution,
      },
      error: null,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      const { error, status } = formatApiError(
        errors.validation('Invalid draw parameters', err.flatten().fieldErrors)
      )
      return NextResponse.json({ data: null, error }, { status })
    }
    const { error, status } = formatApiError(err)
    return NextResponse.json({ data: null, error }, { status })
  }
}
