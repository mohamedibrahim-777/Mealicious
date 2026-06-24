import { db } from './db'

export async function recalculateProductReviews(productId: string) {
  try {
    const aggregate = await db.review.aggregate({
      where: { productId, approved: true },
      _avg: { rating: true },
      _count: { id: true },
    })

    const avgRating = aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0
    const count = aggregate._count.id ?? 0

    await db.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: count,
      },
    })
    console.log(`Recalculated product ${productId}: rating=${avgRating}, reviewCount=${count}`)
  } catch (error) {
    console.error(`Error recalculating reviews for product ${productId}:`, error)
  }
}
