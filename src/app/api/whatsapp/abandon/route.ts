import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Called from checkout when a guest enters phone but hasn't completed payment.
// Records the cart so admin/cron can send recovery messages later.
export async function POST(req: NextRequest) {
  const { phone, name, email, items, cartValue } = await req.json()

  if (!phone || !/^\d{10}$/.test(String(phone).replace(/\D/g, '').slice(-10))) {
    return NextResponse.json({ error: 'Valid phone required' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items[] required' }, { status: 400 })
  }

  const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10)

  // Upsert by phone — keep only latest abandoned cart per phone
  const existing = await db.abandonedCart.findFirst({
    where: { phone: normalizedPhone, recovered: false },
    orderBy: { createdAt: 'desc' },
  })

  if (existing) {
    await db.abandonedCart.update({
      where: { id: existing.id },
      data: {
        name: name || existing.name,
        email: email || existing.email,
        items: JSON.stringify(items),
        cartValue: Number(cartValue) || 0,
        reminderSent: false,
      },
    })
    return NextResponse.json({ ok: true, id: existing.id })
  }

  const cart = await db.abandonedCart.create({
    data: {
      phone: normalizedPhone,
      name: name || null,
      email: email || null,
      items: JSON.stringify(items),
      cartValue: Number(cartValue) || 0,
    },
  })

  return NextResponse.json({ ok: true, id: cart.id }, { status: 201 })
}
