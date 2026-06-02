import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'
import { sendCartRecovery, isConfigured } from '@/lib/whatsapp'

// GET — list abandoned carts (not recovered, reminder not sent)
export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const carts = await db.abandonedCart.findMany({
    where: { recovered: false },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({
    carts: carts.map(c => ({
      id: c.id,
      phone: c.phone,
      name: c.name,
      email: c.email,
      items: (() => { try { return JSON.parse(c.items) } catch { return [] } })(),
      cartValue: c.cartValue,
      reminderSent: c.reminderSent,
      createdAt: c.createdAt.toISOString().slice(0, 10),
    })),
  })
}

// POST — send recovery messages to all (or one) abandoned cart(s)
export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  if (!isConfigured()) {
    return NextResponse.json({ error: 'WhatsApp API not configured.' }, { status: 503 })
  }

  const { cartId, couponCode } = await req.json().catch(() => ({}))

  const carts = cartId
    ? await db.abandonedCart.findMany({ where: { id: cartId, recovered: false } })
    : await db.abandonedCart.findMany({ where: { recovered: false, reminderSent: false }, take: 50 })

  let sent = 0, failed = 0
  for (const cart of carts) {
    let items: { name: string; quantity: number }[] = []
    try { items = JSON.parse(cart.items) } catch {}
    const summary = items.map(i => `${i.quantity}× ${i.name}`).join(', ')
    try {
      await sendCartRecovery(cart.phone, {
        customerName: cart.name || 'there',
        items: summary,
        cartValue: cart.cartValue,
        couponCode,
      })
      await db.abandonedCart.update({ where: { id: cart.id }, data: { reminderSent: true } })
      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ ok: true, total: carts.length, sent, failed })
}
