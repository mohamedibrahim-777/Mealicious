import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const category = await db.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      ...(body.parentId !== undefined && { parentId: body.parentId || null }),
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  try {
    await db.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = (e as { code?: string }).code === 'P2014'
      ? 'Cannot delete category with products. Remove products first.'
      : 'Failed to delete category'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
