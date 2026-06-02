import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/auth-server'
import { getShipmentTracking } from '@/lib/shiprocket'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const awb = new URL(req.url).searchParams.get('awb')
  const orderNumber = new URL(req.url).searchParams.get('orderNumber')

  let trackingAwb = awb
  if (!trackingAwb && orderNumber) {
    const order = await db.order.findUnique({ where: { orderNumber }, select: { trackingId: true } })
    trackingAwb = order?.trackingId ?? null
  }

  if (!trackingAwb) return NextResponse.json({ error: 'AWB or orderNumber required' }, { status: 400 })

  const data = await getShipmentTracking(trackingAwb)
  return NextResponse.json({ tracking: data?.tracking_data ?? null })
}
