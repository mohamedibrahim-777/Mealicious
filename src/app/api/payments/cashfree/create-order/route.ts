import { NextRequest, NextResponse } from 'next/server'
import { createCashfreeOrder, getCashfreeMode, CashfreeNotConfiguredError } from '@/lib/cashfree'
import { priceCartFromDb, computeTotals, type PricingItemInput } from '@/lib/pricing'

const ALLOWED_AMOUNT_DRIFT = 1 // rupee — accept ±₹1 rounding skew vs client

function generateOrderId() {
  return `ML-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      couponCode,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      orderNote,
      clientAmount,
    } = body as {
      items: PricingItemInput[]
      couponCode?: string
      paymentMethod?: 'cod' | 'online'
      customerName: string
      customerEmail: string
      customerPhone: string
      orderNote?: string
      clientAmount?: number
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items[] required' }, { status: 400 })
    }
    if (!customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, customerPhone' },
        { status: 400 },
      )
    }

    const priced = await priceCartFromDb(items)
    const totals = computeTotals(priced, { couponCode, paymentMethod: paymentMethod ?? 'online' })

    if (typeof clientAmount === 'number') {
      if (Math.abs(clientAmount - totals.total) > ALLOWED_AMOUNT_DRIFT) {
        return NextResponse.json(
          {
            error: 'Amount mismatch. Cart prices have changed — refresh and try again.',
            serverTotal: totals.total,
            clientAmount,
          },
          { status: 409 },
        )
      }
    }

    if (totals.total <= 0) {
      return NextResponse.json({ error: 'Order total must be positive' }, { status: 400 })
    }

    const orderId = generateOrderId()
    const fwdHost = req.headers.get('x-forwarded-host') || req.headers.get('host')
    const fwdProto = req.headers.get('x-forwarded-proto') || 'https'
    const publicBase =
      process.env.PUBLIC_BASE_URL ||
      (fwdHost ? `${fwdProto}://${fwdHost}` : req.nextUrl.origin)
    const returnUrl = `${publicBase}/?cashfree_order_id={order_id}#payment-return`

    const cf = await createCashfreeOrder({
      orderId,
      orderAmount: totals.total,
      customer: {
        customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50) || `cust_${Date.now()}`,
        customer_name: customerName || 'Customer',
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      returnUrl,
      orderNote,
    })

    return NextResponse.json({
      orderId: cf.order_id,
      paymentSessionId: cf.payment_session_id,
      mode: getCashfreeMode(),
      serverTotal: totals.total,
      breakdown: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        appliedCoupon: totals.appliedCoupon,
        shipping: totals.shipping,
        codFee: totals.codFee,
        gst: totals.gst,
      },
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
