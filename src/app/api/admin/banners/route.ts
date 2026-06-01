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
  const banner = await db.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      image: body.image ?? null,
      link: body.link ?? null,
      isActive: body.isActive ?? true,
      sortOrder: Number(body.sortOrder) || 0,
    },
  })
  return NextResponse.json({ banner }, { status: 201 })
}
