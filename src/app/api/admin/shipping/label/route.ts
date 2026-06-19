import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'
import { generateLabel } from '@/lib/shiprocket'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { shipmentIds } = await req.json()
  if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
    return NextResponse.json({ error: 'shipmentIds[] required' }, { status: 400 })
  }

  const result = await generateLabel(shipmentIds.map(Number))
  return NextResponse.json({ labelUrl: result?.url ?? null, created: result?.label_created })
}
