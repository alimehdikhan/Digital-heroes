"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, buildEmailTemplate } from '@/lib/email'
import { verifyAdmin } from '@/app/actions/admin'
import { getPlanPrice } from '@/lib/pricing'
import { runDraw } from '@/lib/draw/engine'
import { calculatePrizes } from '@/lib/draw/prizes'
import type { DrawMode, DrawTier } from '@/types/app'

export type DrawResult = {
  winningNumbers: number[];
  totalPool: number;
  jackpotAmount: number;
  prize4Match: number;
  prize3Match: number;
  charityContribution: number;
  rolloverAmount: number;
  winners: {
    userId: string;
    tier: DrawTier;
    matchCount: number;
    matchedNumbers: number[];
    userScores: number[];
    amount: number;
  }[];
  jackpotWinners?: any[];
  silverWinners?: any[];
  bronzeWinners?: any[];
}

export async function simulateDraw(
  month: number, 
  year: number, 
  mode: DrawMode
): Promise<DrawResult & { drawId?: string }> {
  await verifyAdmin()
  
  // ADVERSARIAL FIX: Pagination to bypass 1,000 row API limit
  const activeProfiles: any[] = []
  let hasMore = true
  let page = 0
  const limit = 1000

  while (hasMore) {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id, subscription_status, subscription_plan, charity_percentage')
      .in('subscription_status', ['active', 'trialing'])
      .range(page * limit, (page + 1) * limit - 1)

    if (data && data.length > 0) {
      activeProfiles.push(...data)
      if (data.length < limit) hasMore = false;
      else page++;
    } else {
      hasMore = false
    }
  }

  const activeUserIds = activeProfiles.map(p => p.id)

  let calculatedPool = 0
  let calculatedCharity = 0

  if (activeProfiles.length > 0) {
    for (const p of activeProfiles) {
      const fee = getPlanPrice(p.subscription_plan)
      const monthlyEquivalent = p.subscription_plan === 'yearly' ? fee / 12 : fee;
      calculatedPool += monthlyEquivalent
      const pct = p.charity_percentage || 10
      calculatedCharity += monthlyEquivalent * (pct / 100)
    }
  }

  const poolAmount = calculatedPool
  const charityContribution = calculatedCharity

  // Load scores for the draw month (PRD: monthly draw participation)
  const allScores: any[] = []
  const chunkSize = 500
  for (let i = 0; i < activeUserIds.length; i += chunkSize) {
    const chunk = activeUserIds.slice(i, i + chunkSize)
    const { data } = await supabaseAdmin
      .from('scores')
      .select('user_id, score, date')
      .in('user_id', chunk)
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lte('date', `${year}-${String(month).padStart(2, '0')}-31`)
      .order('date', { ascending: false })
      
    if (data) allScores.push(...data)
  }

  const tempMap = new Map<string, number[]>()
  for (const s of allScores) {
    const scores = tempMap.get(s.user_id) || []
    if (scores.length < 5) {
      scores.push(s.score)
      tempMap.set(s.user_id, scores)
    }
  }

  // Build participants array for the draw engine (only users with 5 scores)
  const participants: Array<{ userId: string; scores: number[] }> = []
  for (const [userId, scores] of Array.from(tempMap.entries())) {
    if (scores.length === 5) {
      participants.push({ userId, scores })
    }
  }

  // Get previous rollover amount
  const { data: previousDraw } = await supabaseAdmin
    .from('draws')
    .select('jackpot_rolled_over, rollover_amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const previousRollover = previousDraw?.jackpot_rolled_over ? Number(previousDraw.rollover_amount) : 0
  const charityPct = activeProfiles.length > 0
    ? Math.max(10, Math.min(...activeProfiles.map((p: any) => p.charity_percentage || 10)))
    : 10

  // Use the draw engine from lib/draw/engine.ts instead of inline logic
  // Handle edge case where no participants have 5 scores
  let engineResult
  if (participants.length === 0) {
    const prizes = calculatePrizes(poolAmount, charityPct, previousRollover)
    engineResult = {
      winningNumbers: [0, 0, 0, 0, 0],
      jackpotAmount: prizes.jackpot,
      jackpotRolledOver: true,
      prize4match: prizes.prize4match,
      prize3match: prizes.prize3match,
      charityContribution: prizes.charityContribution,
      charityPercentage: prizes.charityPercentage,
      totalPool: poolAmount,
      participantCount: 0,
      winners: [],
      jackpotWinners: [],
      silverWinners: [],
      bronzeWinners: [],
    }
  } else {
    engineResult = await runDraw(
      mode,
      participants,
      poolAmount,
      previousRollover,
      charityPct
    )
  }

  // ADVERSARIAL FIX: Simulated Transactional Rollback
  await supabaseAdmin.from('draws').delete().match({ month, year, status: 'in_progress' })
  
  const { data: drawRecord, error: drawInsertError } = await supabaseAdmin
    .from('draws')
    .insert({
      month, year, mode,
      winning_numbers: engineResult.winningNumbers,
      total_pool: engineResult.totalPool,
      jackpot_amount: engineResult.jackpotAmount,
      prize_4match: engineResult.prize4match,
      prize_3match: engineResult.prize3match,
      jackpot_rolled_over: engineResult.jackpotRolledOver,
      rollover_amount: engineResult.jackpotRolledOver ? engineResult.jackpotAmount : 0,
      charity_contribution: engineResult.charityContribution,
      participant_count: engineResult.participantCount,
      status: 'in_progress',
    })
    .select()
    .single()

  if (drawInsertError || !drawRecord) {
    throw new Error('Critical DB Error: Failed to generate draw record.')
  }

  if (engineResult.winners.length > 0) {
    const winnersToInsert = engineResult.winners.map(w => ({
      draw_id: drawRecord.id,
      user_id: w.userId,
      tier: w.tier,
      match_count: w.matchCount,
      matched_numbers: w.matchedNumbers,
      user_scores: w.userScores,
      amount: w.amount,
      payout_status: 'pending'
    }))
    
    // Batch inserts for safety against payload limits
    for (let i = 0; i < winnersToInsert.length; i += chunkSize) {
      const chunk = winnersToInsert.slice(i, i + chunkSize)
      const { error: winErr } = await supabaseAdmin.from('draw_winners').insert(chunk)
      if (winErr) {
        // Rollback explicitly to prevent corrupted draw states
        await supabaseAdmin.from('draws').delete().eq('id', drawRecord.id)
        throw new Error('Critical DB Error: Winners insert failed. Draw aborted safely.')
      }
    }
  }

  return {
    drawId: drawRecord.id,
    winningNumbers: engineResult.winningNumbers,
    totalPool: engineResult.totalPool,
    jackpotAmount: engineResult.jackpotAmount,
    prize4Match: engineResult.prize4match,
    prize3Match: engineResult.prize3match,
    charityContribution: engineResult.charityContribution,
    rolloverAmount: engineResult.jackpotRolledOver ? engineResult.jackpotAmount : 0,
    winners: engineResult.winners.map(w => ({
      userId: w.userId,
      tier: w.tier,
      matchCount: w.matchCount,
      matchedNumbers: w.matchedNumbers,
      userScores: w.userScores,
      amount: w.amount,
    })),
    jackpotWinners: engineResult.jackpotWinners,
    silverWinners: engineResult.silverWinners,
    bronzeWinners: engineResult.bronzeWinners,
  }
}

export async function executeDraw(drawId: string) {
  await verifyAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: draw, error: drawError } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawError || !draw || draw.status !== 'in_progress') {
    throw new Error('Draft draw not found or already executed')
  }

  await supabaseAdmin
    .from('draws')
    .update({ status: 'pending', run_by: user.id, run_at: new Date().toISOString() })
    .eq('id', drawId)

  // ADVERSARIAL FIX: Safely notify without exploding payload loops
  const { data: dbWinners } = await supabaseAdmin.from('draw_winners').select('*').eq('draw_id', drawId)

  if (dbWinners && dbWinners.length > 0) {
    const notifications = dbWinners.map(w => ({
      user_id: w.user_id,
      title: 'Congratulations! You are a Hero.',
      message: `You matched ${w.match_count} numbers in the latest draw and won ₹${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Please submit your proof.`,
      type: 'draw_result',
      action_url: `/proofs/${w.id}` 
    }))
    
    const chunkSize = 500
    for (let i = 0; i < notifications.length; i += chunkSize) {
      await supabaseAdmin.from('notifications').insert(notifications.slice(i, i + chunkSize))
    }

    // ISSUE 2 FIX: Fetch winner profiles in batch, resolve emails via admin API
    const userIds = dbWinners.map((w: any) => w.user_id)
    const { data: winnerProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .in('id', userIds)

    // Build email map by resolving auth users individually (auth_users join is unreliable in batch)
    const emailMap = new Map<string, string>()
    const nameMap = new Map((winnerProfiles || []).map((p: any) => [p.id, p.name]))
    
    for (const userId of userIds) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (authData.user?.email) {
          emailMap.set(userId, authData.user.email)
        }
      } catch {
        // Silently skip users whose email we can't resolve
      }
    }

    const emailBatchSize = 10
    for (let i = 0; i < dbWinners.length; i += emailBatchSize) {
      const batch = dbWinners.slice(i, i + emailBatchSize)
      await Promise.allSettled(batch.map(async (w: any) => {
        const email = emailMap.get(w.user_id)
        const name = nameMap.get(w.user_id) || 'Hero'
        if (!email) return

        await sendEmail({
          to: email,
          subject: 'You Won the Digital Heroes Draw!',
          body: `Congratulations ${name}, you matched ${w.match_count} numbers and won ₹${w.amount}. Log in to claim your prize.`,
          html: buildEmailTemplate(
            'You are a Winner! 🏆',
            `<p>Congratulations <strong>${name}</strong>!</p>
             <p>The algorithmic vault has spoken. You matched <strong>${w.match_count} numbers</strong> in the latest Digital Heroes draw.</p>
             <p>Your prize amount is <strong>₹${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>.</p>
             <p>To claim your prize, please log in to your dashboard and submit a screenshot of your winning scorecard for manual verification.</p>`,
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            'Claim Your Prize'
          )
        })
      }))
    }
  }

  revalidatePath('/admin/draws')
  return draw.id
}

export async function publishDraw(drawId: string) {
  await verifyAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabaseAdmin
    .from('draws')
    .update({ status: 'completed' })
    .eq('id', drawId)
    
  if (error) throw error

  // ISSUE 2 FIX: Batch-send system notification emails to all users
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, name')
  if (profiles && profiles.length > 0) {
    // Resolve emails via admin API (auth_users join is unreliable in batch)
    const emailMap = new Map<string, string>()
    const nameMap = new Map(profiles.map((p: any) => [p.id, p.name]))
    
    for (const profile of profiles) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id)
        if (authData.user?.email) {
          emailMap.set(profile.id, authData.user.email)
        }
      } catch {
        // Silently skip users whose email we can't resolve
      }
    }

    const emailBatchSize = 10
    for (let i = 0; i < profiles.length; i += emailBatchSize) {
      const batch = profiles.slice(i, i + emailBatchSize)
      await Promise.allSettled(batch.map(async (p: any) => {
        const email = emailMap.get(p.id)
        const name = nameMap.get(p.id) || 'Hero'
        if (!email) return

        await sendEmail({
          to: email,
          subject: 'New Draw Results Published',
          body: `Hello ${name}, the results for the latest draw have been published. Check your dashboard to see if you won!`,
          html: buildEmailTemplate(
            'Draw Results Are Live',
            `<p>Hello <strong>${name}</strong>,</p>
             <p>The algorithmic vault has completed processing the latest scores, and the draw results have been published.</p>
             <p>Head over to your dashboard to view the winning numbers and see if you secured a prize.</p>`,
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            'View Results'
          )
        })
      }))
    }
  }

  revalidatePath('/admin/draws')
  return true
}
