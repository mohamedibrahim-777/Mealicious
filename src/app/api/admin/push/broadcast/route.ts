import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { sendPush, isPushConfigured } from '@/lib/push'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const count = await db.pushSubscription.count()
  return NextResponse.json({ subscriberCount: count, configured: isPushConfigured() })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  if (!isPushConfigured()) {
    return NextResponse.json({ error: 'Push not configured. Set VAPID keys.' }, { status: 503 })
  }

  const { title, body, url } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 })
  }

  const subs = await db.pushSubscription.findMany()
  let sent = 0, failed = 0
  const expiredEndpoints: string[] = []

  const payload = { title: String(title), body: String(body), url: url || 'https://mealicious.store' }

  await Promise.all(
    subs.map(async (s) => {
      try {
        const ok = await sendPush({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, payload)
        if (ok) sent++; else failed++
      } catch (e: unknown) {
        if ((e as { expired?: boolean })?.expired) expiredEndpoints.push(s.endpoint)
        failed++
      }
    })
  )

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    await db.pushSubscription.deleteMany({ where: { endpoint: { in: expiredEndpoints } } })
  }

  return NextResponse.json({ ok: true, total: subs.length, sent, failed, cleaned: expiredEndpoints.length })
}
