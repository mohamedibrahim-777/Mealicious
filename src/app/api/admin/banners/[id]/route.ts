import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()

  // Validation
  if (body.title !== undefined && !body.title?.trim()) {
    return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
  }
  if (body.image !== undefined && !body.image?.trim()) {
    return NextResponse.json({ error: 'Image URL cannot be empty' }, { status: 400 })
  }
  if (body.link !== undefined && !body.link?.trim()) {
    return NextResponse.json({ error: 'Link cannot be empty' }, { status: 400 })
  }

  const banner = await db.banner.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle?.trim() ?? null }),
      ...(body.image !== undefined && { image: body.image.trim() }),
      ...(body.link !== undefined && { link: body.link.trim() }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    },
  })
  return NextResponse.json({ banner })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  await db.banner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
