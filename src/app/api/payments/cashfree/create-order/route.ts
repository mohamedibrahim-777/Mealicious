import { NextRequest, NextResponse } from 'next/server'
import { createCashfreeOrder, getCashfreeMode, CashfreeNotConfiguredError } from '@/lib/cashfree'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      orderNote,
    } = body as {
      orderId: string
      amount: number
      customerName: string
      customerEmail: string
      customerPhone: string
      orderNote?: string
    }

    if (!orderId || !amount || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerEmail, customerPhone' },
        { status: 400 }
      )
    }

    const origin = req.nextUrl.origin
    const returnUrl = `${origin}/?cashfree_order_id={order_id}#payment-return`

    const order = await createCashfreeOrder({
      orderId,
      orderAmount: Number(amount),
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
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      mode: getCashfreeMode(),
    })
  } catch (err) {
    if (err instanceof CashfreeNotConfiguredError) {
      return NextResponse.json(
        { error: err.message, code: 'PAYMENT_NOT_CONFIGURED' },
        { status: 503 }
      )
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
