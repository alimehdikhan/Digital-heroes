"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, buildEmailTemplate } from '@/lib/email'
import { verifyAdmin } from '@/app/actions/admin'

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
    tier: 'jackpot' | 'silver' | 'bronze';
    matchCount: number;
    matchedNumbers: number[];
    userScores: number[];
    amount: number;
  }[];
  jackpotWinners?: any[];
  silverWinners?: any[];
  bronzeWinners?: any[];
}

// Helper to generate 5 unique numbers between 1 and 45
function generateWinningNumbers(mode: 'random' | 'algorithmic', userScoresMap?: Map<string, number[]>): number[] {
  const nums = new Set<number>()
  
  if (mode === 'algorithmic' && userScoresMap && userScoresMap.size > 0) {
    // Calculate frequency of each number chosen by users
    const frequencies = new Map<number, number>()
    for (let i = 1; i <= 45; i++) frequencies.set(i, 0)
    
    for (const scores of Array.from(userScoresMap.values())) {
      for (const s of scores) {
        frequencies.set(s, (frequencies.get(s) || 0) + 1)
      }
    }
    
    // Sort numbers by least frequency to reward uncommon choices (algorithmic edge)
    const weightedPool: number[] = []
    const maxFreq = Math.max(...Array.from(frequencies.values()))
    
    for (const [num, freq] of Array.from(frequencies.entries())) {
      // Inverse weighting: (maxFreq - freq + 1) tickets in the pool
      const weight = (maxFreq - freq) + 1
      for (let i = 0; i < weight; i++) {
        weightedPool.push(num)
      }
    }
    
    while (nums.size < 5) {
      const array = new Uint32Array(1)
      crypto.getRandomValues(array)
      const rIndex = array[0] % weightedPool.length
      nums.add(weightedPool[rIndex])
    }
  } else {
    while (nums.size < 5) {
      const array = new Uint8Array(1)
      crypto.getRandomValues(array)
      const num = (array[0] % 45) + 1
      nums.add(num)
    }
  }
  
  return Array.from(nums).sort((a, b) => a - b)
}

export async function simulateDraw(
  month: number, 
  year: number, 
  mode: 'random' | 'algorithmic'
): Promise<DrawResult & { drawId?: string }> {
  await verifyAdmin()
  const supabase = await createClient()
  
  // Get active users and their latest 5 scores
  const { data: activeProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, subscription_status, subscription_plan, charity_percentage')
    .in('subscription_status', ['active', 'trialing'])

  const activeUserIds = activeProfiles?.map(p => p.id) || []

  // Auto-calculate pool amount and accurate charity contribution
  let calculatedPool = 0
  let calculatedCharity = 0

  if (activeProfiles && activeProfiles.length > 0) {
    for (const p of activeProfiles) {
      const fee = p.subscription_plan === 'yearly' ? 16.66 : 20.00
      calculatedPool += fee
      const pct = p.charity_percentage || 10
      calculatedCharity += fee * (pct / 100)
    }
  }

  const poolAmount = calculatedPool
  const charityContribution = calculatedCharity

  // Fetch all scores for these users, then group by user and take latest 5
  // For performance in a real app, this should be a Supabase RPC or view.
  // We'll do a simplified approach here.
  const { data: allScores } = await supabaseAdmin
    .from('scores')
    .select('user_id, score, date')
    .in('user_id', activeUserIds)
    .order('date', { ascending: false })

  const tempMap = new Map<string, number[]>()
  if (allScores) {
    for (const s of allScores) {
      const scores = tempMap.get(s.user_id) || []
      if (scores.length < 5) {
        scores.push(s.score)
        tempMap.set(s.user_id, scores)
      }
    }
  }

  const userScoresMap = new Map<string, number[]>()
  for (const [userId, scores] of Array.from(tempMap.entries())) {
    if (scores.length === 5) {
      userScoresMap.set(userId, scores)
    }
  }

  const winningNumbers = generateWinningNumbers(mode, userScoresMap)
  
  // Financials
  const netPool = poolAmount - charityContribution
  
  // Check for previous rollover
  const { data: previousDraw } = await supabaseAdmin
    .from('draws')
    .select('jackpot_rolled_over, rollover_amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const rolloverAmount = previousDraw?.jackpot_rolled_over ? previousDraw.rollover_amount : 0
  
  const jackpotAmount = (netPool * 0.40) + rolloverAmount
  const prize4Match = netPool * 0.35
  const prize3Match = netPool * 0.25

  const winners: DrawResult['winners'] = []

  // Determine winners
  let hasJackpotWinner = false
  
  for (const [userId, scores] of Array.from(userScoresMap.entries())) {
    const matchedNumbers = scores.filter(s => winningNumbers.includes(s))
    const matchCount = matchedNumbers.length
    
    if (matchCount >= 3) {
      let tier: 'jackpot' | 'silver' | 'bronze' = 'bronze'
      if (matchCount === 5) {
        tier = 'jackpot'
        hasJackpotWinner = true
      } else if (matchCount === 4) {
        tier = 'silver'
      }

      winners.push({
        userId,
        tier,
        matchCount,
        matchedNumbers,
        userScores: scores,
        amount: 0 // Will divide later
      })
    }
  }

  // Divide prizes
  const jackpotWinners = winners.filter(w => w.tier === 'jackpot')
  const silverWinners = winners.filter(w => w.tier === 'silver')
  const bronzeWinners = winners.filter(w => w.tier === 'bronze')

  winners.forEach(w => {
    if (w.tier === 'jackpot') w.amount = jackpotAmount / jackpotWinners.length
    if (w.tier === 'silver') w.amount = prize4Match / silverWinners.length
    if (w.tier === 'bronze') w.amount = prize3Match / bronzeWinners.length
  })
  // --- NEW: Persist Draft Draw to DB ---
  // Delete existing in_progress for this month/year
  await supabaseAdmin.from('draws').delete().match({ month, year, status: 'in_progress' })
  
  const { data: drawRecord } = await supabaseAdmin
    .from('draws')
    .insert({
      month,
      year,
      mode,
      winning_numbers: winningNumbers,
      total_pool: poolAmount,
      jackpot_amount: hasJackpotWinner ? jackpotAmount : rolloverAmount,
      prize_4match: prize4Match,
      prize_3match: prize3Match,
      jackpot_rolled_over: rolloverAmount > 0,
      rollover_amount: rolloverAmount,
      charity_contribution: charityContribution,
      status: 'in_progress', // acts as draft
    })
    .select()
    .single()

  if (drawRecord && winners.length > 0) {
    const winnersToInsert = winners.map(w => ({
      draw_id: drawRecord.id,
      user_id: w.userId,
      tier: w.tier,
      match_count: w.matchCount,
      matched_numbers: w.matchedNumbers,
      user_scores: w.userScores,
      amount: w.amount,
      payout_status: 'pending'
    }))
    await supabaseAdmin.from('draw_winners').insert(winnersToInsert)
  }

  return {
    drawId: drawRecord?.id,
    winningNumbers,
    totalPool: poolAmount,
    jackpotAmount: hasJackpotWinner ? jackpotAmount : 0,
    prize4Match,
    prize3Match,
    charityContribution,
    rolloverAmount: hasJackpotWinner ? 0 : jackpotAmount,
    winners,
    jackpotWinners,
    silverWinners,
    bronzeWinners
  }
}

export async function executeDraw(drawId: string) {
  await verifyAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Find the draft draw
  const { data: draw, error: drawError } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawError || !draw || draw.status !== 'in_progress') {
    throw new Error('Draft draw not found or already executed')
  }

  // Update status to pending (finalized)
  await supabaseAdmin
    .from('draws')
    .update({ status: 'pending', run_by: user.id, run_at: new Date().toISOString() })
    .eq('id', drawId)

  // Fetch winners
  const { data: dbWinners } = await supabaseAdmin.from('draw_winners').select('*').eq('draw_id', drawId)

  if (dbWinners && dbWinners.length > 0) {
    // Notify winners
    const notifications = dbWinners.map(w => ({
      user_id: w.user_id,
      title: 'Congratulations! You are a Hero.',
      message: `You matched ${w.match_count} numbers in the latest draw and won ₹${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Please submit your proof.`,
      type: 'draw_result',
      action_url: `/proofs/${draw.id}` 
    }))
    
    await supabaseAdmin.from('notifications').insert(notifications)

    // Notify winners via Email (Server-side)
    for (const w of dbWinners) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('name, auth_users!inner(email)').eq('id', w.user_id).single()
      if (profile && profile.auth_users) {
        await sendEmail({
          to: (profile.auth_users as any).email || (profile.auth_users as any)?.[0]?.email,
          subject: 'You Won the Digital Heroes Draw!',
          body: `Congratulations ${profile.name}, you matched ${w.match_count} numbers and won ₹${w.amount}. Log in to claim your prize.`,
          html: buildEmailTemplate(
            'You are a Winner! 🏆',
            `<p>Congratulations <strong>${profile.name}</strong>!</p>
             <p>The algorithmic vault has spoken. You matched <strong>${w.match_count} numbers</strong> in the latest Digital Heroes draw.</p>
             <p>Your prize amount is <strong>₹${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>.</p>
             <p>To claim your prize, please log in to your dashboard and submit a screenshot of your winning scorecard for manual verification.</p>`,
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            'Claim Your Prize'
          )
        })
      }
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

  // System Update Email to all users
  const { data: profiles } = await supabaseAdmin.from('profiles').select('name, auth_users!inner(email)')
  if (profiles) {
    for (const p of profiles) {
      if (p.auth_users) {
        await sendEmail({
          to: (p.auth_users as any).email || (p.auth_users as any)?.[0]?.email,
          subject: 'New Draw Results Published',
          body: `Hello ${p.name}, the results for the latest draw have been published. Check your dashboard to see if you won!`,
          html: buildEmailTemplate(
            'Draw Results Are Live',
            `<p>Hello <strong>${p.name}</strong>,</p>
             <p>The algorithmic vault has completed processing the latest scores, and the draw results have been published.</p>
             <p>Head over to your dashboard to view the winning numbers and see if you secured a prize.</p>`,
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            'View Results'
          )
        })
      }
    }
  }

  revalidatePath('/admin/draws')
  return true
}
