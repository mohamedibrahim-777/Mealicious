import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { notifyOrderShipped, notifyOrderDelivered, notifyOrderCancelled } from '@/lib/whatsapp'
import { completeReferralReward } from '@/lib/referral-reward'

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

  const existing = await db.order.findUnique({ where: { orderNumber: id }, include: { user: true } })
  const updated = await db.order.update({ where: { orderNumber: id }, data })

  // WhatsApp delivery alerts (fire-and-forget)
  if (existing && body.status && body.status !== existing.status) {
    let addr: Record<string, string> = {}
    try { addr = JSON.parse(existing.shippingAddr) } catch {}
    const phone = existing.user?.phone || addr.phone
    const name = existing.user?.name || addr.fullName || 'Customer'
    if (phone) {
      const newStatus = String(body.status).toLowerCase()
      if (newStatus === 'shipped') {
        notifyOrderShipped(phone, {
          customerName: name,
          orderNumber: existing.orderNumber,
          courierName: String(data.shippingProvider || existing.shippingProvider || 'Courier'),
          awb: String(data.trackingId || existing.trackingId || ''),
          trackingUrl: String(data.trackingUrl || existing.trackingUrl || 'https://mealicious.store'),
        }).catch(() => {})
      } else if (newStatus === 'delivered') {
        notifyOrderDelivered(phone, { customerName: name, orderNumber: existing.orderNumber }).catch(() => {})
      } else if (newStatus === 'cancelled') {
        notifyOrderCancelled(phone, { customerName: name, orderNumber: existing.orderNumber, total: existing.total }).catch(() => {})
      }
    }
  }

  // Credit referrer once a COD order is genuinely delivered (prepaid credited at payment)
  if (existing && body.status && String(body.status).toLowerCase() === 'delivered' && existing.status !== 'delivered') {
    completeReferralReward(existing.userId).catch(() => {})
  }

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
