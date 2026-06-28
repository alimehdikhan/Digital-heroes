import type { DrawTier } from '@/types/app'

export interface PrizeBreakdown {
  jackpot: number
  prize4match: number
  prize3match: number
  charityContribution: number
  charityPercentage: number
}

export interface CalculatePrizesOptions {
  /** Pre-calculated charity total (sum of per-user contributions). Takes precedence over charityPercentage. */
  charityContribution?: number
  /** Fallback when charityContribution is not provided. Minimum 10% enforced. */
  charityPercentage?: number
  rolloverAmount?: number
}

/**
 * Calculate prize pool distribution.
 *
 * Rules (per PRD):
 * - Charity is deducted from the pool (per-user sums or minimum 10%)
 * - Remaining pool distributed: 40% jackpot (5-match), 35% silver (4-match), 25% bronze (3-match)
 * - If previous jackpot rolled over, add rolloverAmount to jackpot
 */
export function calculatePrizes(
  totalPool: number,
  options: CalculatePrizesOptions = {}
): PrizeBreakdown {
  const rolloverAmount = options.rolloverAmount ?? 0
  let charityContribution: number
  let charityPercentage: number

  if (options.charityContribution != null) {
    charityContribution = round2(Math.min(options.charityContribution, totalPool))
    charityPercentage =
      totalPool > 0 ? round2((charityContribution / totalPool) * 100) : 10
  } else {
    charityPercentage = Math.max(options.charityPercentage ?? 10, 10)
    charityContribution = round2(totalPool * (charityPercentage / 100))
  }

  const distributable = round2(Math.max(0, totalPool - charityContribution))

  return {
    jackpot:          round2(distributable * 0.40 + rolloverAmount),
    prize4match:      round2(distributable * 0.35),
    prize3match:      round2(distributable * 0.25),
    charityContribution,
    charityPercentage,
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
