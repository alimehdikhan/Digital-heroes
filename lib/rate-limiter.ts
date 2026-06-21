/**
 * Simple in-memory rate limiter for API routes.
 * Works per-request within a single serverless instance.
 * Limits: 30 requests per 60-second window per IP.
 * In serverless deployments, this resets on cold starts but
 * still protects against rapid burst attacks within a single invocation.
 */

const requestCounts = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 30   // per window

export function checkRateLimit(ip: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetAt) {
    // First request or window expired
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS }
  }

  record.count += 1

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetAt: record.resetAt }
}

/**
 * Extract a consistent identifier from a request object.
 * Uses IP from headers, falling back to a default.
 */
export function getRequestIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Periodically clean up stale entries to prevent memory leaks.
 */
const CLEANUP_INTERVAL = 5 * 60_000 // 5 minutes
let lastCleanup = Date.now()

function cleanupStaleEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key)
    }
  }
}

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupStaleEntries, CLEANUP_INTERVAL)
}
