import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'
import { createShiprocketOrder, assignAWB, generateLabel } from '@/lib/shiprocket'
import { notifyOrderShipped } from '@/lib/whatsapp'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const { orderNumber, courierId, weight = 0.5, length = 15, breadth = 12, height = 10 } = await req.json()

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { user: true, items: { include: { product: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  let addr: Record<string, string> = {}
  try { addr = JSON.parse(order.shippingAddr) } catch {}

  // Create Shiprocket order
  const srOrder = await createShiprocketOrder({
    orderId: order.orderNumber,
    orderDate: format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm'),
    pickupLocation: process.env.SHIPROCKET_PICKUP_NAME || 'Primary',
    billingName: addr.fullName || order.user?.name || 'Customer',
    billingAddress: [addr.address1, addr.address2].filter(Boolean).join(', '),
    billingCity: addr.city || '',
    billingPincode: addr.pincode || '',
    billingState: addr.state || '',
    billingCountry: 'India',
    billingEmail: order.user?.email || addr.email || '',
    billingPhone: addr.phone || order.user?.phone || '',
    orderItems: order.items.map(i => ({
      name: i.name,
      sku: i.product?.sku || i.productId.slice(-8),
      units: i.quantity,
      sellingPrice: i.price,
      hsn: 21069099,
    })),
    paymentMethod: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    subTotal: order.subtotal,
    length: Number(length),
    breadth: Number(breadth),
    height: Number(height),
    weight: Number(weight),
  })

  if (!srOrder.shipment_id) {
    return NextResponse.json({ error: 'Shiprocket order creation failed', detail: srOrder }, { status: 500 })
  }

  // Assign AWB (courier)
  let awb = srOrder.awb_code
  let courierName = srOrder.courier_name
  if (courierId && srOrder.shipment_id) {
    const awbRes = await assignAWB(srOrder.shipment_id, Number(courierId))
    awb = awbRes?.response?.data?.awb_code || awb
    courierName = awbRes?.response?.data?.courier_name || courierName
  }

  // Generate label
  let labelUrl = srOrder.label_url
  if (srOrder.shipment_id) {
    const labelRes = await generateLabel([srOrder.shipment_id])
    labelUrl = labelRes?.url || labelUrl
  }

  // Update order in DB
  const updated = await db.order.update({
    where: { orderNumber },
    data: {
      trackingId: awb || null,
      trackingUrl: awb ? `https://shiprocket.co/tracking/${awb}` : null,
      shippingProvider: courierName || 'Shiprocket',
      status: 'shipped',
    },
  })

  // WhatsApp shipping update (fire-and-forget)
  const waPhone = addr.phone || order.user?.phone
  if (waPhone && awb) {
    notifyOrderShipped(waPhone, {
      customerName: addr.fullName || order.user?.name || 'Customer',
      orderNumber: order.orderNumber,
      courierName: courierName || 'Shiprocket',
      awb,
      trackingUrl: updated.trackingUrl || 'https://mealicious.store',
    }).catch(() => {})
  }

  return NextResponse.json({
    ok: true,
    shiprocketOrderId: srOrder.order_id,
    shipmentId: srOrder.shipment_id,
    awb,
    courierName,
    labelUrl,
    trackingUrl: updated.trackingUrl,
  })
}
