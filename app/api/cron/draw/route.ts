import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { simulateDraw, executeDraw, publishDraw } from '@/app/actions/draw'
import type { DrawMode } from '@/types/app'

/**
 * GET /api/cron/draw
 *
 * Vercel Cron Job — runs automatically on the 1st of every month.
 * Triggers the previous month's draw using algorithmic mode.
 * Secured via CRON_SECRET environment variable passed in the request header.
 *
 * Expected headers:
 *   Authorization: Bearer {CRON_SECRET}
 */
export async function GET(request: Request) {
  try {
    // Verify the cron secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
      console.error('[Cron] CRON_SECRET environment variable is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid or missing cron secret' }, { status: 401 })
    }

    // Determine the previous month (cron runs on the 1st of each month)
    const now = new Date()
    let month = now.getMonth()  // 0-indexed
    let year = now.getFullYear()

    if (month === 0) {
      // January → previous December of last year
      month = 12
      year -= 1
    }

    const drawMonth = month
    const drawYear = year
    const mode: DrawMode = 'algorithmic'

    // ISSUE 3 FIX: Check if draw already completed for this month (duplicate cron protection)
    const { data: existingDraw } = await supabaseAdmin
      .from('draws')
      .select('id, status')
      .eq('month', drawMonth)
      .eq('year', drawYear)
      .eq('status', 'completed')
      .maybeSingle()

    if (existingDraw) {
      console.info(`[Cron] Draw already completed for ${drawMonth}/${drawYear}, skipping`)
      return NextResponse.json({ success: true, skipped: true, drawId: existingDraw.id })
    }

    console.info(`[Cron] Starting automated draw for ${drawMonth}/${drawYear} (mode: ${mode})`)

    // Step 1: Simulate the draw (creates in_progress draw record with winners)
    const result = await simulateDraw(drawMonth, drawYear, mode, true)

    if (!result.drawId) {
      throw new Error('Draw simulation did not return a draw ID')
    }

    console.info(`[Cron] Draw simulated: ${result.drawId} (${result.winners.length} winners)`)

    // Step 2: Execute the draw (sets status to pending, notifies winners)
    await executeDraw(result.drawId, '__cron__')

    console.info(`[Cron] Draw executed: ${result.drawId}`)

    // Step 3: Publish the draw (sets status to completed, notifies all users)
    await publishDraw(result.drawId, '__cron__')

    console.info(`[Cron] Draw published: ${result.drawId}`)

    return NextResponse.json({
      success: true,
      drawId: result.drawId,
      month: drawMonth,
      year: drawYear,
      totalPool: result.totalPool,
      winnerCount: result.winners.length,
      jackpotRolledOver: result.winners.filter(w => w.tier === 'jackpot').length === 0,
    })
  } catch (err: any) {
    console.error(`[Cron] Draw failed: ${err.message}`)
    return NextResponse.json(
      { error: 'Automated draw failed', message: err.message },
      { status: 500 }
    )
  }
}
