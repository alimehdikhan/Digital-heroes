import { generateRandomNumbers } from './random'

/**
 * Algorithmic Draw Mode
 *
 * Weighted by most frequent user scores.
 * Algorithm:
 * 1. Calculate the frequency of all submitted scores (1-45).
 * 2. Create a weighted pool where highly frequent scores appear more often.
 * 3. Draw 5 unique numbers from this pool probabilistically.
 * 4. Fallback to random if pool is exhausted.
 */
export async function generateAlgorithmicNumbers(
  allScores: number[]
): Promise<number[]> {
  if (allScores.length === 0) {
    console.warn('[Draw] No scores provided to algorithmic mode — using random fallback')
    return generateRandomNumbers()
  }

  // 1. Calculate frequency of each number 1-45
  const frequencies = new Map<number, number>()
  for (let i = 1; i <= 45; i++) frequencies.set(i, 0)
  
  for (const score of allScores) {
    if (score >= 1 && score <= 45) {
      frequencies.set(score, frequencies.get(score)! + 1)
    }
  }

  // 2. Create weighted pool (give base weight of 1 so unselected numbers still have a tiny chance)
  const pool: number[] = []
  for (const [num, freq] of Array.from(frequencies.entries())) {
    const weight = freq > 0 ? freq * 2 : 1 // multiply frequency to heavily weight popular scores
    for (let i = 0; i < weight; i++) {
      pool.push(num)
    }
  }

  // 3. Draw 5 unique numbers pseudo-randomly from the weighted pool
  const numbers: number[] = []
  const seen = new Set<number>()

  while (seen.size < 5 && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length)
    const num = pool[randomIndex]
    
    if (!seen.has(num)) {
      seen.add(num)
      numbers.push(num)
    }
    
    // Remove all instances of this chosen number from the pool so we don't draw it again
    for (let i = pool.length - 1; i >= 0; i--) {
      if (pool[i] === num) {
        pool.splice(i, 1)
      }
    }
  }

  // 4. Fallback if something goes wrong
  while (seen.size < 5) {
    const fallbacks = generateRandomNumbers()
    for (const n of fallbacks) {
      if (!seen.has(n)) {
        seen.add(n)
        numbers.push(n)
      }
      if (seen.size >= 5) break
    }
  }

  return numbers.sort((a, b) => a - b)
}
