import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { safeJson } from '@/lib/admin-helpers'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const rows = await db.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    orders: rows.map((o) => ({
      id: o.orderNumber,
      dbId: o.id,
      customer: o.user?.name ?? 'Guest',
      email: o.user?.email ?? '',
      items: o.items.length,
      itemDetails: o.items,
      total: o.total,
      subtotal: o.subtotal,
      shipping: o.shipping,
      tax: o.tax,
      discount: o.discount,
      status: capitalize(o.status),
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      shippingAddr: safeJson(o.shippingAddr, {}),
      date: o.createdAt.toISOString().slice(0, 10),
    })),
  })
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}
