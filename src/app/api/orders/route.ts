import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface OrderItemInput {
  productId?: string
  name: string
  image?: string
  price: number
  quantity: number
  variant?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      subtotal,
      shipping,
      discount,
      tax,
      total,
      paymentMethod,
      shippingAddr,
      billingAddr,
      customerEmail,
      customerName,
      customerPhone,
      couponCode,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }
    if (!customerEmail) {
      return NextResponse.json({ error: 'customerEmail required' }, { status: 400 })
    }

    const user = await db.user.upsert({
      where: { email: String(customerEmail).toLowerCase() },
      update: {
        ...(customerName ? { name: customerName } : {}),
        ...(customerPhone ? { phone: customerPhone } : {}),
      },
      create: {
        email: String(customerEmail).toLowerCase(),
        name: customerName || String(customerEmail).split('@')[0],
        phone: customerPhone || null,
      },
    })

    const orderNumber = `ML-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const itemsToCreate = await Promise.all(
      (items as OrderItemInput[]).map(async (it) => {
        let productId = it.productId
        if (!productId && it.name) {
          const slug = it.name.toLowerCase().replace(/\s+/g, '-')
          const p = await db.product.findUnique({ where: { slug } })
          productId = p?.id
        }
        if (!productId) {
          throw new Error(`productId missing for item "${it.name}"`)
        }
        return {
          productId,
          name: it.name,
          image: it.image ?? '',
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
          variant: it.variant ?? null,
          subtotal: (Number(it.price) || 0) * (Number(it.quantity) || 1),
        }
      }),
    )

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'confirmed',
        subtotal: Number(subtotal) || 0,
        shipping: Number(shipping) || 0,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        total: Number(total) || 0,
        paymentMethod: paymentMethod ?? null,
        paymentStatus: 'pending',
        shippingAddr: JSON.stringify(shippingAddr ?? {}),
        billingAddr: billingAddr ? JSON.stringify(billingAddr) : null,
        couponCode: couponCode ?? null,
        items: { create: itemsToCreate },
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
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
