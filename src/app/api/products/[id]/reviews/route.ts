import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reviews = await db.review.findMany({
    where: { productId: id, approved: true },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })
  return NextResponse.json({
    reviews: reviews.map(r => ({
      id: r.id,
      name: r.user?.name ?? r.guestName ?? 'Anonymous',
      rating: r.rating,
      title: r.title ?? '',
      comment: r.comment,
      date: r.createdAt.toISOString(),
      verified: !!r.userId,
    })),
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { rating, title, comment, name, email } = body

  if (!rating || !comment || !name) {
    return NextResponse.json({ error: 'rating, comment and name required' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 })
  }

  const product = await db.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const review = await db.review.create({
    data: {
      productId: id,
      guestName: String(name).trim(),
      guestEmail: email ? String(email).trim() : null,
      rating: Number(rating),
      title: title ? String(title).trim() : null,
      comment: String(comment).trim(),
      approved: false,
    },
  })

  return NextResponse.json({ ok: true, id: review.id, message: 'Review submitted for moderation' }, { status: 201 })
}
