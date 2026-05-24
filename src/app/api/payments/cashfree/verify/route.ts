import { NextRequest, NextResponse } from 'next/server'
import { verifyCashfreeOrder, CashfreeNotConfiguredError } from '@/lib/cashfree'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
  }
  try {
    const status = await verifyCashfreeOrder(orderId)
    return NextResponse.json({
      orderId: status.order_id,
      status: status.order_status,
      amount: status.order_amount,
      currency: status.order_currency,
      paid: status.order_status === 'PAID',
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
