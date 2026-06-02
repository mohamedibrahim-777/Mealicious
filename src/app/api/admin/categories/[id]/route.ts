import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
