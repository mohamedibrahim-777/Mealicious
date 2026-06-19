import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { sendPromotion, isConfigured } from '@/lib/whatsapp'

// Broadcast a promotional message to a customer segment
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { message, couponCode, segment = 'all' } = await req.json()

  if (!message || String(message).trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!isConfigured()) {
    return NextResponse.json({ error: 'WhatsApp API not configured. Set WHATSAPP_* env vars.' }, { status: 503 })
  }

  // Build recipient list by segment
  let users: { name: string; phone: string | null }[] = []

  if (segment === 'all') {
    users = await db.user.findMany({ where: { phone: { not: null } }, select: { name: true, phone: true } })
  } else if (segment === 'customers') {
    // users who placed at least one order
    const withOrders = await db.user.findMany({
      where: { phone: { not: null }, orders: { some: {} } },
      select: { name: true, phone: true },
    })
    users = withOrders
  } else if (segment === 'recent') {
    // users who ordered in last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recent = await db.user.findMany({
      where: { phone: { not: null }, orders: { some: { createdAt: { gte: since } } } },
      select: { name: true, phone: true },
    })
    users = recent
  }

  const recipients = users.filter(u => u.phone)

  // Send with small concurrency to respect rate limits
  let sent = 0, failed = 0
  const BATCH = 10
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(u =>
        sendPromotion(u.phone!, { customerName: u.name, message: String(message), couponCode })
      )
    )
    results.forEach(r => { if (r.status === 'fulfilled') sent++; else failed++ })
  }

  return NextResponse.json({ ok: true, totalRecipients: recipients.length, sent, failed })
}
