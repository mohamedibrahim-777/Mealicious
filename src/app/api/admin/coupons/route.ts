import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const body = await req.json()

  // Simplified schema: code, discount (%), status
  // Maps discount to value, status to isActive
  // Defaults other fields for backward compatibility
  const coupon = await db.coupon.create({
    data: {
      code: String(body.code).toUpperCase(),
      type: 'percentage',
      value: Number(body.discount) || 0,
      minOrder: 0,
      maxDiscount: null,
      usageLimit: null,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: body.status === 'active',
    },
  })
  return NextResponse.json({ coupon }, { status: 201 })
}
