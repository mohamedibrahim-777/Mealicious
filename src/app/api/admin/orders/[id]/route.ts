import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.status) data.status = String(body.status).toLowerCase()
  if (body.paymentStatus) data.paymentStatus = String(body.paymentStatus).toLowerCase()
  if (body.trackingId !== undefined) data.trackingId = body.trackingId
  if (body.trackingUrl !== undefined) data.trackingUrl = body.trackingUrl
  if (body.shippingProvider !== undefined) data.shippingProvider = body.shippingProvider
  const updated = await db.order.update({ where: { orderNumber: id }, data })
  return NextResponse.json({ order: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  // Cascade: delete order items first
  const o = await db.order.findUnique({ where: { orderNumber: id }, include: { items: true } })
  if (!o) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.orderItem.deleteMany({ where: { orderId: o.id } })
  await db.order.delete({ where: { id: o.id } })
  return NextResponse.json({ ok: true })
}
