import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

function transformReview(review: any) {
  return {
    id: review.id,
    productName: review.product?.name ?? 'Unknown',
    rating: review.rating,
    status: review.approved ? 'approved' : 'pending',
  }
}

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
    reviews: reviews.map(transformReview),
  })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const body = await req.json()
  const { productName, rating, status, guestName, guestEmail } = body

  try {
    // Find product by name
    const product = await db.product.findUnique({
      where: { name: productName },
    })

    if (!product) {
      return NextResponse.json(
        { error: `Product "${productName}" not found` },
        { status: 400 }
      )
    }

    const review = await db.review.create({
      data: {
        productId: product.id,
        rating: Number(rating) || 5,
        approved: status === 'approved',
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        comment: '', // Empty comment for admin-created reviews
      },
      include: { product: true, user: true },
    })

    return NextResponse.json(transformReview(review))
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
