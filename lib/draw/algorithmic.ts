import { generateRandomNumbers } from './random'

/**
 * Algorithmic Draw Mode
 *
 * Deterministic: the same set of participant scores always produces the same 5 numbers.
 * Algorithm:
 * 1. Collect ALL scores from all participants, sort ascending.
 * 2. Encode as a comma-separated string.
 * 3. Hash with SHA-256 (Web Crypto API).
 * 4. Walk the hash bytes, converting each byte to a number in 1–45.
 * 5. Collect 5 unique numbers; fall back to random if hash is exhausted.
 */
export async function generateAlgorithmicNumbers(
  allScores: number[]
): Promise<number[]> {
  if (allScores.length === 0) {
    console.warn('[Draw] No scores provided to algorithmic mode — using random fallback')
    return generateRandomNumbers()
  }

  const sorted = [...allScores].sort((a, b) => a - b)
  const payload = sorted.join(',')

  const encoder = new TextEncoder()
  const data = encoder.encode(payload)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // Extract 5 unique numbers using explicit array (avoids Set spread)
  const numbers: number[] = []
  const seen = new Set<number>()

  for (const byte of hashArray) {
    if (seen.size >= 5) break
    const num = (byte % 45) + 1
    if (!seen.has(num)) {
      seen.add(num)
      numbers.push(num)
    }
  }

  // Fallback if hash didn't yield 5 unique values (extremely rare)
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
