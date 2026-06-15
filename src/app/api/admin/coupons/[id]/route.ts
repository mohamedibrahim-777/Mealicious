import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()

  // Support both simplified schema (code, discount, status) and full schema
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      ...(body.code !== undefined && { code: String(body.code).toUpperCase() }),
      ...(body.discount !== undefined && { value: Number(body.discount) }),
      ...(body.status !== undefined && { isActive: body.status === 'active' }),
      // Support full schema for backward compatibility
      ...(body.type !== undefined && { type: body.type }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.minOrder !== undefined && { minOrder: Number(body.minOrder) }),
      ...(body.maxDiscount !== undefined && { maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null }),
      ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit ? Number(body.usageLimit) : null }),
      ...(body.validFrom !== undefined && { validFrom: new Date(body.validFrom) }),
      ...(body.validTo !== undefined && { validTo: new Date(body.validTo) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    },
  })
  return NextResponse.json({ coupon })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  await db.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
