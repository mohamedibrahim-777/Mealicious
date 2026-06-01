import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const url = new URL(req.url)
  const approved = url.searchParams.get('approved')
  const reviews = await db.review.findMany({
    where: approved !== null ? { approved: approved === 'true' } : undefined,
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    reviews: reviews.map(r => ({
      id: r.id,
      user: r.user?.name ?? 'Unknown',
      product: r.product?.name ?? 'Unknown',
      rating: r.rating,
      title: r.title ?? '',
      comment: r.comment,
      approved: r.approved,
      createdAt: r.createdAt.toISOString().slice(0, 10),
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id, approved } = await req.json()
  const review = await db.review.update({ where: { id }, data: { approved: Boolean(approved) } })
  return NextResponse.json({ review })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await req.json()
  await db.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
