import { NextRequest, NextResponse } from 'next/server'

// In-memory sliding-window rate limiter. Suitable for a single-instance
// deployment. For multi-instance, swap the Map for Redis.

interface Bucket { count: number; resetAt: number }
const store = new Map<string, Bucket>()

// Periodic cleanup of expired buckets (avoid unbounded memory)
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [k, b] of store) if (b.resetAt < now) store.delete(k)
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Returns null if allowed, or a 429 NextResponse if the limit is exceeded.
 * @param key unique bucket key (e.g. `login:${ip}`)
 * @param limit max requests per window
 * @param windowMs window size in ms
 */
export function rateLimit(key: string, limit: number, windowMs: number): NextResponse | null {
  const now = Date.now()
  sweep(now)
  const bucket = store.get(key)

  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  bucket.count++
  return null
}

// Convenience: rate-limit a request by IP under a named action.
export function limitByIp(req: NextRequest, action: string, limit: number, windowMs: number): NextResponse | null {
  return rateLimit(`${action}:${getClientIp(req)}`, limit, windowMs)
}
