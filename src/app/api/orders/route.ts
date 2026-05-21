import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, subtotal, shipping, discount, tax, total, paymentMethod, shippingAddr } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const orderNumber = `ML-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    return NextResponse.json({
      success: true,
      order: {
        orderNumber,
        status: 'confirmed',
        items,
        subtotal,
        shipping,
        discount,
        tax,
        total,
        paymentMethod,
        shippingAddr,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
