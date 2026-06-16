import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ banners })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()

  // Validation
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!body.image?.trim()) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }
  if (!body.link?.trim()) {
    return NextResponse.json({ error: 'Link is required' }, { status: 400 })
  }

  const banner = await db.banner.create({
    data: {
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() ?? null,
      image: body.image.trim(),
      link: body.link.trim(),
      isActive: body.isActive ?? true,
      sortOrder: Number(body.sortOrder) || 0,
    },
  })
  return NextResponse.json({ banner }, { status: 201 })
}
