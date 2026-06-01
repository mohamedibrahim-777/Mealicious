import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'
import { renderToBuffer } from '@react-pdf/renderer'
import { GstInvoiceDoc } from '@/components/admin/GstInvoice'
import { createElement } from 'react'
import { format } from 'date-fns'

const GSTIN = process.env.GSTIN || 'NOT_SET'
const SELLER_STATE = process.env.SELLER_STATE || 'Maharashtra'
const HSN_CODE = process.env.HSN_CODE || '21069099'
const SELLER_NAME = process.env.SELLER_NAME || 'Mealicious Store'
const SELLER_ADDRESS = process.env.SELLER_ADDRESS || 'India'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const { orderId } = await params
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let shippingAddr: Record<string, string> = {}
  try { shippingAddr = JSON.parse(order.shippingAddr) } catch {}

  const buyerState = String(shippingAddr.state || '').trim()
  const isInterState = buyerState.toLowerCase() !== SELLER_STATE.toLowerCase()

  const items = order.items.map(item => ({
    name: item.name + (item.variant ? ` (${item.variant})` : ''),
    hsnCode: HSN_CODE,
    quantity: item.quantity,
    unitPrice: item.price,
    taxableValue: item.price * item.quantity,
  }))

  const taxableBase = order.subtotal - order.discount + order.shipping
  const taxAmount = Math.round(taxableBase * 0.18 * 100) / 100

  const doc = createElement(GstInvoiceDoc, {
    invoiceNumber: order.orderNumber,
    invoiceDate: format(new Date(order.createdAt), 'dd MMM yyyy'),
    seller: { name: SELLER_NAME, address: SELLER_ADDRESS, gstin: GSTIN, state: SELLER_STATE },
    buyer: {
      name: order.user?.name ?? shippingAddr.name ?? 'Customer',
      address: [shippingAddr.address, shippingAddr.city, shippingAddr.pincode].filter(Boolean).join(', '),
      state: buyerState || 'Unknown',
      phone: order.user?.phone ?? shippingAddr.phone ?? null,
    },
    items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    taxAmount,
    isInterState,
    total: order.total,
    paymentMethod: order.paymentMethod ?? 'N/A',
  })

  const buffer = await renderToBuffer(doc)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  })
}
