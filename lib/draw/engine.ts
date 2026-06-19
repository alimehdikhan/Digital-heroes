import { generateRandomNumbers } from './random'
import { generateAlgorithmicNumbers } from './algorithmic'
import {
  calculatePrizes,
  countMatches,
  getTier,
  getMatchedNumbers,
  splitPrize,
} from './prizes'
import type { DrawMode, DrawTier } from '@/types/app'

export interface DrawParticipant {
  userId: string
  scores: number[]  // 1–5 scores for the draw month
}

export interface DrawWinnerResult {
  userId: string
  tier: DrawTier
  matchCount: number
  matchedNumbers: number[]
  userScores: number[]
  amount: number
}

export interface DrawResult {
  winningNumbers: number[]
  jackpotAmount: number
  jackpotRolledOver: boolean
  prize4match: number
  prize3match: number
  charityContribution: number
  charityPercentage: number
  totalPool: number
  participantCount: number
  winners: DrawWinnerResult[]
  jackpotWinners: DrawWinnerResult[]
  silverWinners: DrawWinnerResult[]
  bronzeWinners: DrawWinnerResult[]
}

/**
 * Main draw engine — runs the monthly draw.
 *
 * @param mode           - 'random' | 'algorithmic'
 * @param participants   - All eligible subscribers with their scores
 * @param totalPool      - Total prize pool for this month
 * @param rolloverAmount - Accumulated jackpot from previous rolled-over months
 * @param charityPct     - Charity contribution percentage (min 10)
 */
export async function runDraw(
  mode: DrawMode,
  participants: DrawParticipant[],
  totalPool: number,
  rolloverAmount: number = 0,
  charityPct: number = 10
): Promise<DrawResult> {
  if (totalPool <= 0) throw new Error('Total pool must be greater than 0')
  if (participants.length === 0) {
    throw new Error('Cannot run a draw with no participants')
  }

  // 1. Generate winning numbers
  let winningNumbers: number[]
  if (mode === 'algorithmic') {
    const allScores = participants.flatMap(p => p.scores)
    winningNumbers = await generateAlgorithmicNumbers(allScores)
  } else {
    winningNumbers = generateRandomNumbers()
  }

  // 2. Calculate prize pool distribution
  const prizes = calculatePrizes(totalPool, charityPct, rolloverAmount)

  // 3. Find winners per tier
  const jackpotWinners: DrawWinnerResult[] = []
  const silverWinners: DrawWinnerResult[] = []
  const bronzeWinners: DrawWinnerResult[] = []

  for (const participant of participants) {
    const matchCount = countMatches(participant.scores, winningNumbers)
    const tier = getTier(matchCount)
    if (!tier) continue

    const matchedNumbers = getMatchedNumbers(participant.scores, winningNumbers)
    const result: Omit<DrawWinnerResult, 'amount'> = {
      userId: participant.userId,
      tier,
      matchCount: matchCount as 3 | 4 | 5,
      matchedNumbers,
      userScores: participant.scores,
    }

    if (tier === 'jackpot') jackpotWinners.push({ ...result, amount: 0 })
    else if (tier === 'silver') silverWinners.push({ ...result, amount: 0 })
    else if (tier === 'bronze') bronzeWinners.push({ ...result, amount: 0 })
  }

  // 4. Jackpot rollover if no winner
  const jackpotRolledOver = jackpotWinners.length === 0

  // 5. Calculate per-winner amounts
  const jackpotPerWinner = splitPrize(prizes.jackpot, jackpotWinners.length)
  const silverPerWinner  = splitPrize(prizes.prize4match, silverWinners.length)
  const bronzePerWinner  = splitPrize(prizes.prize3match, bronzeWinners.length)

  const finalJackpotWinners = jackpotWinners.map(w => ({ ...w, amount: jackpotPerWinner }))
  const finalSilverWinners  = silverWinners.map(w => ({ ...w, amount: silverPerWinner }))
  const finalBronzeWinners  = bronzeWinners.map(w => ({ ...w, amount: bronzePerWinner }))

  return {
    winningNumbers,
    jackpotAmount:        prizes.jackpot,
    jackpotRolledOver,
    prize4match:          prizes.prize4match,
    prize3match:          prizes.prize3match,
    charityContribution:  prizes.charityContribution,
    charityPercentage:    prizes.charityPercentage,
    totalPool,
    participantCount:     participants.length,
    winners:              [...finalJackpotWinners, ...finalSilverWinners, ...finalBronzeWinners],
    jackpotWinners:       finalJackpotWinners,
    silverWinners:        finalSilverWinners,
    bronzeWinners:        finalBronzeWinners,
  }
}
