import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { priceCartFromDb, computeTotals, type PricingItemInput } from '@/lib/pricing'

const ALLOWED_AMOUNT_DRIFT = 1

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      couponCode,
      paymentMethod,
      shippingAddr,
      billingAddr,
      customerEmail,
      customerName,
      customerPhone,
      clientTotal,
      cashfreeOrderId,
    } = body as {
      items: PricingItemInput[]
      couponCode?: string
      paymentMethod?: 'cod' | 'online'
      shippingAddr: Record<string, unknown>
      billingAddr?: Record<string, unknown>
      customerEmail: string
      customerName?: string
      customerPhone?: string
      clientTotal?: number
      cashfreeOrderId?: string
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items[] required' }, { status: 400 })
    }
    if (!customerEmail) {
      return NextResponse.json({ error: 'customerEmail required' }, { status: 400 })
    }

    const priced = await priceCartFromDb(items)
    const totals = computeTotals(priced, { couponCode, paymentMethod: paymentMethod ?? 'cod' })

    if (typeof clientTotal === 'number' && Math.abs(clientTotal - totals.total) > ALLOWED_AMOUNT_DRIFT) {
      return NextResponse.json(
        {
          error: 'Amount mismatch. Cart prices have changed — refresh and try again.',
          serverTotal: totals.total,
          clientTotal,
        },
        { status: 409 },
      )
    }

    // Find-or-create only — never overwrite an existing User's profile from an
    // unauthenticated checkout. Shipping contact lives on the Order row.
    const emailLc = String(customerEmail).toLowerCase()
    const user =
      (await db.user.findUnique({ where: { email: emailLc } })) ??
      (await db.user.create({
        data: {
          email: emailLc,
          name: customerName || emailLc.split('@')[0],
          phone: customerPhone || null,
        },
      }))

    const orderNumber =
      cashfreeOrderId ||
      `ML-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'confirmed',
        subtotal: totals.subtotal,
        shipping: totals.shipping + totals.codFee,
        discount: totals.discount,
        tax: totals.gst,
        total: totals.total,
        paymentMethod: paymentMethod ?? null,
        paymentStatus: 'pending',
        shippingAddr: JSON.stringify(shippingAddr ?? {}),
        billingAddr: billingAddr ? JSON.stringify(billingAddr) : null,
        couponCode: totals.appliedCoupon,
        items: {
          create: priced.map((p) => ({
            productId: p.productId,
            name: p.name,
            image: p.image,
            price: p.unitPrice,
            quantity: p.quantity,
            variant: p.variant,
            subtotal: p.lineSubtotal,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingAddr: JSON.parse(order.shippingAddr),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }),
        createdAt: order.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Order API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
