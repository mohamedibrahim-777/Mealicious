import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

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
  await db.wishlist.deleteMany({ where: { userId: id } })
  await db.review.deleteMany({ where: { userId: id } })
  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
