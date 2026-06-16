import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const blogs = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ blogs })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const slug = (body.slug || String(body.title || 'post').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).slice(0, 100)
  const post = await db.blogPost.create({
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt ?? null,
      content: body.content ?? '',
      image: body.image ?? null,
      author: body.author ?? null,
      category: body.category ?? null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      published: body.published ?? false,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
