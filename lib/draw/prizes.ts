import type { DrawTier } from '@/types/app'

export interface PrizeBreakdown {
  jackpot: number
  prize4match: number
  prize3match: number
  charityContribution: number
  charityPercentage: number
}

/**
 * Calculate prize pool distribution.
 *
 * Rules (per PRD):
 * - Minimum 10% of total pool goes to charity (enforced)
 * - Remaining pool distributed: 40% jackpot (5-match), 35% silver (4-match), 25% bronze (3-match)
 * - If previous jackpot rolled over, add rolloverAmount to jackpot
 */
export function calculatePrizes(
  totalPool: number,
  charityPercentage: number = 10,
  rolloverAmount: number = 0
): PrizeBreakdown {
  // Enforce minimum 10% charity
  const effectiveCharityPct = Math.max(charityPercentage, 10)
  const charityContribution = round2(totalPool * (effectiveCharityPct / 100))
  const distributable = round2(totalPool - charityContribution)

  return {
    jackpot:          round2(distributable * 0.40 + rolloverAmount),
    prize4match:      round2(distributable * 0.35),
    prize3match:      round2(distributable * 0.25),
    charityContribution,
    charityPercentage: effectiveCharityPct,
  }
}

/**
 * Count how many of a user's scores appear in the winning numbers set.
 */
export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winSet = new Set(winningNumbers)
  return userScores.filter(s => winSet.has(s)).length
}

/**
 * Determine tier from match count.
 * Returns null if the user is not a winner.
 */
export function getTier(matchCount: number): DrawTier | null {
  if (matchCount >= 5) return 'jackpot'
  if (matchCount === 4) return 'silver'
  if (matchCount === 3) return 'bronze'
  return null
}

/**
 * Get the matched numbers (intersection of user scores and winning numbers).
 */
export function getMatchedNumbers(
  userScores: number[],
  winningNumbers: number[]
): number[] {
  const winSet = new Set(winningNumbers)
  return userScores.filter(s => winSet.has(s))
}

/** Split a prize pool equally among multiple winners at the same tier. */
export function splitPrize(total: number, winnerCount: number): number {
  if (winnerCount === 0) return 0
  return round2(total / winnerCount)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
