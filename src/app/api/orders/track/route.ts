import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { format } from 'date-fns'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber')?.trim().toUpperCase()

  if (!orderNumber) {
    return NextResponse.json({ error: 'orderNumber required' }, { status: 400 })
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: { select: { name: true } } } },
      user: { select: { name: true, email: true, phone: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  let shippingAddr: Record<string, string> = {}
  try { shippingAddr = JSON.parse(order.shippingAddr) } catch {}

  const currentStatusIdx = STATUS_STEPS.indexOf(order.status)

  const steps = STATUS_STEPS.map((s, i) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    status: i < currentStatusIdx ? 'completed' : i === currentStatusIdx ? 'current' : 'upcoming',
  }))

  // Mask PII — public tracking shows only city+state, not full address or personal details
  const maskedAddr = {
    city: shippingAddr.city ?? '',
    state: shippingAddr.state ?? '',
    pincode: shippingAddr.pincode ? shippingAddr.pincode.slice(0, 3) + '***' : '',
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a'),
      total: order.total,
      items: order.items.map(i => ({ name: i.name, quantity: i.quantity, variant: i.variant })),
      shippingAddr: maskedAddr,
      trackingId: order.trackingId,
      trackingUrl: order.trackingUrl,
      shippingProvider: order.shippingProvider,
      steps,
    },
  })
}
