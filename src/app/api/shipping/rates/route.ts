import { NextRequest, NextResponse } from 'next/server'
import { getShippingRates } from '@/lib/shiprocket'

const PICKUP_PINCODE = process.env.SHIPROCKET_PICKUP_PINCODE || '600001'

export async function POST(req: NextRequest) {
  const { pincode, weight = 0.5, cod = false, declaredValue = 500 } = await req.json()

  if (!pincode || !/^\d{6}$/.test(String(pincode))) {
    return NextResponse.json({ error: 'Valid 6-digit pincode required' }, { status: 400 })
  }

  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    // Shiprocket not configured — return flat rate fallback
    return NextResponse.json({
      rates: [],
      fallback: { rate: declaredValue >= 599 ? 0 : 49, label: 'Standard Delivery' },
    })
  }

  try {
    const rates = await getShippingRates({
      pickupPostcode: PICKUP_PINCODE,
      deliveryPostcode: String(pincode),
      weight: Number(weight),
      cod: Boolean(cod),
      declaredValue: Number(declaredValue),
    })

    return NextResponse.json({
      rates: rates.map(r => ({
        courierId: r.courier_id,
        courierName: r.courier_name,
        rate: r.rate,
        estimatedDays: r.estimated_delivery_days,
        etd: r.etd,
        cod: r.cod,
      })).sort((a, b) => a.rate - b.rate),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: msg, rates: [] }, { status: 500 })
  }
}
