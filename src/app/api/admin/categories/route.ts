import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(_req: NextRequest) {
  const categories = await db.category.findMany({
    include: { children: true, parent: true },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const slug = (body.slug || String(body.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).slice(0, 80)
  const category = await db.category.create({
    data: {
      name: body.name,
      slug,
      image: body.image ?? null,
      icon: body.icon ?? null,
      featured: body.featured ?? false,
      sortOrder: Number(body.sortOrder) || 0,
      parentId: body.parentId || null,
    },
  })
  return NextResponse.json({ category }, { status: 201 })
}
