import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Shiprocket webhook — configure at: Shiprocket > Settings > API > Webhooks
// URL: https://mealicious.store/api/shipping/webhook

const STATUS_MAP: Record<string, string> = {
  'PICKUP COMPLETE': 'processing',
  'PICKUP SCHEDULED': 'processing',
  'OUT FOR PICKUP': 'processing',
  'IN TRANSIT': 'shipped',
  'OUT FOR DELIVERY': 'shipped',
  'DELIVERED': 'delivered',
  'CANCELLED': 'cancelled',
  'RTO INITIATED': 'cancelled',
  'RTO DELIVERED': 'cancelled',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const awb = body.awb || body.awb_code
    const srStatus = String(body.current_status || body.status || '').toUpperCase()
    const channelOrderId = body.channel_order_id || body.order_id

    if (!channelOrderId && !awb) {
      return NextResponse.json({ ok: false, reason: 'no identifier' })
    }

    let order = null

    // Find by order number (channel_order_id = our orderNumber)
    if (channelOrderId) {
      order = await db.order.findUnique({ where: { orderNumber: String(channelOrderId) } })
    }

    // Fallback: find by AWB
    if (!order && awb) {
      order = await db.order.findFirst({ where: { trackingId: String(awb) } })
    }

    if (!order) {
      return NextResponse.json({ ok: false, reason: 'order not found' })
    }

    const updateData: Record<string, unknown> = {}

    // Map Shiprocket status to our status
    const mappedStatus = STATUS_MAP[srStatus]
    if (mappedStatus && order.status !== mappedStatus) {
      updateData.status = mappedStatus
    }

    // Update tracking info
    if (awb && !order.trackingId) {
      updateData.trackingId = String(awb)
      updateData.trackingUrl = `https://shiprocket.co/tracking/${awb}`
    }
    if (body.courier_name && !order.shippingProvider) {
      updateData.shippingProvider = String(body.courier_name)
    }

    if (Object.keys(updateData).length > 0) {
      await db.order.update({ where: { id: order.id }, data: updateData })
    }

    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, status: updateData.status || order.status })
  } catch (e: unknown) {
    console.error('Shiprocket webhook error:', e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'unknown' }, { status: 500 })
  }
}
