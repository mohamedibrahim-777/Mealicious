import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { notifyOrderConfirmed } from '@/lib/whatsapp'

// Cashfree PG v3 webhook signature:
//   HMAC-SHA256(timestamp + rawBody, SECRET_KEY) -> base64
// Compared timing-safe with header `x-webhook-signature`.
function verifySignature(rawBody: string, timestamp: string, signature: string): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp + rawBody)
    .digest('base64')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('x-webhook-signature') || ''
  const ts = req.headers.get('x-webhook-timestamp') || ''

  if (!sig || !ts) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 })
  }
  if (!verifySignature(rawBody, ts, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const type = String(payload.type ?? '')
  const data = payload.data as { order?: { order_id?: string; order_amount?: number }; payment?: { payment_status?: string; payment_amount?: number } } | undefined
  const orderId = data?.order?.order_id
  const paymentStatus = data?.payment?.payment_status
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  const dbOrder = await db.order.findUnique({ where: { orderNumber: orderId } })
  if (!dbOrder) {
    // Webhook for an order we don't own. Acknowledge to stop retries.
    return NextResponse.json({ ok: true, note: 'order not found' })
  }

  let nextStatus: string | null = null
  if (type === 'PAYMENT_SUCCESS_WEBHOOK' && paymentStatus === 'SUCCESS') {
    // Server-side amount check: Cashfree-reported amount must match DB.
    const cfAmount = data?.payment?.payment_amount ?? data?.order?.order_amount
    if (typeof cfAmount === 'number' && Math.abs(cfAmount - dbOrder.total) > 1) {
      return NextResponse.json(
        { error: 'amount mismatch', dbTotal: dbOrder.total, cfAmount },
        { status: 409 },
      )
    }
    nextStatus = 'paid'
  } else if (type === 'PAYMENT_FAILED_WEBHOOK') {
    nextStatus = 'failed'
  } else if (type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
    nextStatus = 'failed'
  }

  if (nextStatus && dbOrder.paymentStatus !== nextStatus) {
    if (nextStatus === 'paid') {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: dbOrder.id },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed'
          },
        })

        const items = await tx.orderItem.findMany({
          where: { orderId: dbOrder.id }
        })

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }
      })

      // Get the order with items and user details for notification
      const fullOrder = await db.order.findUnique({
        where: { id: dbOrder.id },
        include: { user: true, items: true }
      })

      if (fullOrder) {
        let addr: Record<string, string> = {}
        try { addr = JSON.parse(fullOrder.shippingAddr) } catch {}
        const waPhone = fullOrder.user?.phone || addr.phone
        if (waPhone) {
          const itemsSummary = fullOrder.items.map(i => `${i.quantity}× ${i.name}`).join(', ')
          notifyOrderConfirmed(waPhone, {
            customerName: fullOrder.user?.name || addr.fullName || 'Customer',
            orderNumber: fullOrder.orderNumber,
            items: itemsSummary,
            total: fullOrder.total,
            paymentMethod: 'Online Payment',
          }).catch(() => {})
        }
      }
    } else {
      await db.order.update({
        where: { id: dbOrder.id },
        data: { paymentStatus: nextStatus },
      })
    }
  }

  return NextResponse.json({ ok: true, status: nextStatus ?? 'ignored' })
}
