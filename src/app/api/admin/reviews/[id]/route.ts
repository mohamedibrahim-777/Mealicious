import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

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
  const { error } = await requireAdminSession(req)
  if (error) return error

  const body = await req.json()
  const { id } = params

  try {
    const review = await db.review.update({
      where: { id },
      data: {
        ...(body.rating !== undefined && { rating: Number(body.rating) }),
        ...(body.status !== undefined && { approved: body.status === 'approved' }),
        // Note: productName updates would require a product lookup by name
        // For now, we only support rating and status updates
      },
      include: { product: true, user: true },
    })

    return NextResponse.json(transformReview(review))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const { id } = params

  try {
    await db.review.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
