/**
 * Random Draw Mode
 * Generates 5 unique numbers from 1-45 using a cryptographically secure source.
 * Uses Web Crypto API (works in both Node.js 18+ and Edge runtime).
 */

export function generateRandomNumbers(): number[] {
  const numbers: number[] = []
  const seen = new Set<number>()

  while (seen.size < 5) {
    const array = new Uint8Array(1)
    crypto.getRandomValues(array)
    const num = (array[0] % 45) + 1
    if (!seen.has(num)) {
      seen.add(num)
      numbers.push(num)
    }
  }

  return numbers.sort((a, b) => a - b)
}
