import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { recalculateProductReviews } from '@/lib/reviews-helper'

interface RouteContext {
  params: { id: string }
}

function transformReview(review: any) {
  return {
    id: review.id,
    productName: review.product?.name ?? 'Unknown',
    rating: review.rating,
    status: review.approved ? 'approved' : 'pending',
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const body = await req.json()
  const { id } = params

  try {
    // Find old review to know its old product ID
    const oldReview = await db.review.findUnique({ where: { id } })
    if (!oldReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // If productName is being updated, find the product by name
    let updateData: any = {
      ...(body.rating !== undefined && { rating: Number(body.rating) }),
      ...(body.status !== undefined && { approved: body.status === 'approved' }),
    }

    if (body.productName !== undefined) {
      const product = await db.product.findUnique({ where: { name: body.productName } })
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      updateData.product = { connect: { id: product.id } }
    }

    const review = await db.review.update({
      where: { id },
      data: updateData,
      include: { product: true, user: true },
    })

    // Recalculate for the new product
    await recalculateProductReviews(review.productId)

    // Recalculate for the old product if it was changed
    if (oldReview.productId !== review.productId) {
      await recalculateProductReviews(oldReview.productId)
    }

    return NextResponse.json(transformReview(review))
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { id } = params

  try {
    const review = await db.review.findUnique({ where: { id } })
    if (review) {
      await db.review.delete({ where: { id } })
      await recalculateProductReviews(review.productId)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}

