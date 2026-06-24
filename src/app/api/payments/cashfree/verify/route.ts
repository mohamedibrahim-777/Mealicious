import { NextRequest, NextResponse } from 'next/server'
import { verifyCashfreeOrder, CashfreeNotConfiguredError } from '@/lib/cashfree'
import { db } from '@/lib/db'
import { completeReferralReward } from '@/lib/referral-reward'
import { notifyOrderConfirmed } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
  }
  // Only reveal status for orders we own; prevents enumeration of arbitrary Cashfree order IDs.
  const dbOrder = await db.order.findUnique({ where: { orderNumber: orderId } })
  if (!dbOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  try {
    const status = await verifyCashfreeOrder(orderId)
    const paid = status.order_status === 'PAID'

    // Cross-check: Cashfree-reported amount must match what we persisted.
    if (paid && Math.abs(status.order_amount - dbOrder.total) > 1) {
      return NextResponse.json(
        { error: 'Amount mismatch between Cashfree and DB', dbTotal: dbOrder.total, cfAmount: status.order_amount },
        { status: 409 },
      )
    }

    // Persist authoritative paid state (idempotent).
    if (paid && dbOrder.paymentStatus !== 'paid') {
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

      // Credit referrer now that payment is captured (prepaid)
      completeReferralReward(dbOrder.userId).catch(() => {})
    }

    return NextResponse.json({
      orderId: status.order_id,
      status: status.order_status,
      amount: status.order_amount,
      currency: status.order_currency,
      paid,
    })
  } catch (err) {
    if (err instanceof CashfreeNotConfiguredError) {
      return NextResponse.json(
        { error: err.message, code: 'PAYMENT_NOT_CONFIGURED' },
        { status: 503 },
      )
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
