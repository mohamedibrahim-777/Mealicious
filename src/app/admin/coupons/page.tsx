export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CouponsClient } from './CouponsClient'

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Coupons" />
      <CouponsClient coupons={coupons.map(c => ({
        id: c.id,
        code: c.code,
        discount: c.value,
        status: c.isActive ? 'active' : 'inactive',
      }))} />
    </div>
  )
}
