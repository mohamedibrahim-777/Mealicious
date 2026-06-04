import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { limitByIp } from '@/lib/rate-limit'

// Called from checkout when a guest enters phone but hasn't completed payment.
// Records the cart so admin/cron can send recovery messages later.
//
// SECURITY: item names are resolved server-side from the DB by productId — the
// client cannot inject arbitrary text into outbound WhatsApp messages. The name
// field is sanitized (strip URLs / control chars) to prevent phishing content.

function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw
    .replace(/https?:\/\/\S+/gi, '')      // strip URLs
    .replace(/[\u0000-\u001F\u007F]/g, '') // strip control chars
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 60)
  return cleaned || null
}

export async function POST(req: NextRequest) {
  const limited = limitByIp(req, 'abandon', 10, 10 * 60 * 1000)
  if (limited) return limited

  const body = await req.json()
  const { phone, name, email, items, cartValue } = body

  const cleanPhone = String(phone ?? '').replace(/\D/g, '').slice(-10)
  if (cleanPhone.length !== 10) {
    return NextResponse.json({ error: 'Valid phone required' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items[] required' }, { status: 400 })
  }

  // Resolve product names from DB — reject items with no valid productId
  const productIds = items
    .map((i: { productId?: string }) => i?.productId)
    .filter((id): id is string => typeof id === 'string')

  if (productIds.length === 0) {
    return NextResponse.json({ error: 'items must include valid productId' }, { status: 400 })
  }

  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, salePrice: true },
  })
  const productMap = new Map(products.map(p => [p.id, p]))

  const resolvedItems = items
    .map((i: { productId?: string; quantity?: number }) => {
      const p = i.productId ? productMap.get(i.productId) : undefined
      if (!p) return null
      return { name: p.name, quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)), price: p.salePrice ?? p.price }
    })
    .filter(Boolean) as { name: string; quantity: number; price: number }[]

  if (resolvedItems.length === 0) {
    return NextResponse.json({ error: 'No valid products' }, { status: 400 })
  }

  const computedValue = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const safeName = sanitizeName(name)
  const safeEmail = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 120) : null

  const existing = await db.abandonedCart.findFirst({
    where: { phone: cleanPhone, recovered: false },
    orderBy: { createdAt: 'desc' },
  })

  if (existing) {
    await db.abandonedCart.update({
      where: { id: existing.id },
      data: {
        name: safeName ?? existing.name,
        email: safeEmail ?? existing.email,
        items: JSON.stringify(resolvedItems),
        cartValue: computedValue,
        reminderSent: false,
      },
    })
    return NextResponse.json({ ok: true, id: existing.id })
  }

  const cart = await db.abandonedCart.create({
    data: {
      phone: cleanPhone,
      name: safeName,
      email: safeEmail,
      items: JSON.stringify(resolvedItems),
      cartValue: computedValue,
    },
  })

  return NextResponse.json({ ok: true, id: cart.id }, { status: 201 })
}
