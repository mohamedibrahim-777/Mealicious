export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ReviewsClient } from './ReviewsClient'
import { format } from 'date-fns'

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <div>
      <AdminHeader title="Reviews" />
      <ReviewsClient reviews={reviews.map(r => ({
        id: r.id,
        user: r.user?.name ?? 'Unknown',
        product: r.product?.name ?? 'Unknown',
        rating: r.rating,
        title: r.title ?? '',
        comment: r.comment,
        approved: r.approved,
        date: format(new Date(r.createdAt), 'dd MMM yyyy'),
      }))} />
    </div>
  )
}
