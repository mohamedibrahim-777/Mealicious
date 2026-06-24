import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { recalculateProductReviews } from '@/lib/reviews-helper'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.role) data.role = body.role === 'admin' ? 'admin' : 'customer'
  if (body.name !== undefined) data.name = body.name
  if (body.phone !== undefined) data.phone = body.phone
  const updated = await db.user.update({ where: { id }, data })
  return NextResponse.json({ user: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  // Don't allow deleting users with orders (FK constraint will error anyway)
  const orderCount = await db.order.count({ where: { userId: id } })
  if (orderCount > 0) {
    return NextResponse.json({ error: 'Cannot delete user with existing orders' }, { status: 400 })
  }

  // Find reviews of the user to know which products are affected
  const userReviews = await db.review.findMany({
    where: { userId: id },
    select: { productId: true },
  })

  await db.wishlist.deleteMany({ where: { userId: id } })
  await db.review.deleteMany({ where: { userId: id } })
  await db.user.delete({ where: { id } })

  // Recalculate rating stats for all affected products
  const productIds = Array.from(new Set(userReviews.map((r) => r.productId)))
  for (const pid of productIds) {
    await recalculateProductReviews(pid)
  }

  return NextResponse.json({ ok: true })
}

