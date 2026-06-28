import { generateRandomNumbers } from './random'

/**
 * Algorithmic Draw Mode (PRD)
 *
 * Winning numbers are weighted by score frequency across all participants:
 * - ~3 numbers drawn from the most-frequent score pool
 * - ~2 numbers drawn from the least-frequent score pool
 * Falls back to random when data is insufficient.
 */
export async function generateAlgorithmicNumbers(
  allScores: number[]
): Promise<number[]> {
  if (allScores.length === 0) {
    console.warn('[Draw] No scores provided to algorithmic mode — using random fallback')
    return generateRandomNumbers()
  }

  const frequencies = new Map<number, number>()
  for (let i = 1; i <= 45; i++) frequencies.set(i, 0)

  for (const score of allScores) {
    if (score >= 1 && score <= 45) {
      frequencies.set(score, frequencies.get(score)! + 1)
    }
  }

  const active = Array.from(frequencies.entries()).filter(([, freq]) => freq > 0)
  if (active.length === 0) return generateRandomNumbers()

  const maxFreq = Math.max(...active.map(([, freq]) => freq))
  const sorted = [...active].sort((a, b) => b[1] - a[1])
  const midpoint = Math.ceil(sorted.length / 2)
  const mostFrequent = sorted.slice(0, midpoint)
  const leastFrequent = sorted.slice(midpoint)

  const mostPool = buildWeightedPool(mostFrequent, (freq) => freq * 2)
  const leastPool = buildWeightedPool(
    leastFrequent.length > 0 ? leastFrequent : mostFrequent,
    (freq) => (maxFreq - freq + 1) * 2
  )

  const numbers: number[] = []
  const seen = new Set<number>()

  drawFromPool(mostPool, 3, seen, numbers)
  drawFromPool(leastPool, 5 - numbers.length, seen, numbers)

  while (numbers.length < 5) {
    for (const n of generateRandomNumbers()) {
      if (!seen.has(n)) {
        seen.add(n)
        numbers.push(n)
      }
      if (numbers.length >= 5) break
    }
  }

  return numbers.sort((a, b) => a - b)
}

function buildWeightedPool(
  entries: [number, number][],
  weightFn: (freq: number) => number
): number[] {
  const pool: number[] = []
  for (const [num, freq] of entries) {
    const weight = weightFn(freq)
    for (let i = 0; i < weight; i++) pool.push(num)
  }
  return pool
}

function drawFromPool(
  pool: number[],
  count: number,
  seen: Set<number>,
  numbers: number[]
): void {
  const working = [...pool]
  let drawn = 0

  while (drawn < count && working.length > 0) {
    const index = Math.floor(Math.random() * working.length)
    const num = working[index]

    if (!seen.has(num)) {
      seen.add(num)
      numbers.push(num)
      drawn++
    }

    for (let i = working.length - 1; i >= 0; i--) {
      if (working[i] === num) working.splice(i, 1)
    }
  }
}