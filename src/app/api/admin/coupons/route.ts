import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const coupon = await db.coupon.create({
    data: {
      code: String(body.code).toUpperCase(),
      type: body.type,
      value: Number(body.value),
      minOrder: Number(body.minOrder) || 0,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      validFrom: new Date(body.validFrom),
      validTo: new Date(body.validTo),
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json({ coupon }, { status: 201 })
}
